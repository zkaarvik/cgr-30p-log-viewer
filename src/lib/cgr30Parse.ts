import {
  KnownLogTypes,
  LogGroups,
  type LogGroup,
  type ParsedLogfile,
} from "./types";

const FIRST_LINE_VALIDATION = "Electronics International Inc";
const CSV_HEADER_PREFIX = "TIME,";

// Parse a CGR-30P log file. General Format as follows:
/*
Electronics International Inc
CGR-30P Flight Data Recording
Aircraft ID....: C-GABC

Unit ID........: 1234566
EDC Models.....: P-4-6-H,,
SW Version.....: 1.2
Tracking Number: 524
Local Time: 2025/03/30 14:52:53 
Zulu Time.: 2025/03/30 21:52:53 
Flight Number: 101
Engine Hours.: 345.00 hrs
Tach Time....: 1200.50 hrs
Data Logging Interval: 0.3 sec

TIME, RPML, RPMR, RPM, MP, EGT1, EGT1;*F, EGT2;*F
17:06:23, 2140, 2140, 2140, 22.5, 1354, 1292, 1375
17:06:24, 2140, 2140, 2140, 22.5, 1354, 1292, 1375
17:06:25, 2140, 2140, 2140, 22.5, 1354, 1292, 1375
17:06:26, 2140, 2140, 2140, 22.5, 1354, 1292, 1375
*/
export const parseLogfile = async (
  logfile: File
): Promise<ParsedLogfile | null> => {
  const parsedLogfile: ParsedLogfile = {
    preamble: {},
    datasets: [],
    calculated: { limits: { x: { min: 0, max: 0 } } },
  };

  // Validate.. Expect first line to read "Electronics International Inc"
  let isValid = false;
  let parsedPreamble = false;
  let parsedDatasetHeaders = false;
  let xValue = 0;
  let xValueInitial = 0;
  let xValueIncrement = 1;
  let timeColumnIndex = -1;
  let timeMode: "local" | "utc" | "unknown" = "unknown";
  let currentDateParts:
    | { year: number; month: number; day: number }
    | null = null;
  let lastTimeSeconds: number | null = null;
  let sameSecondCount = 0;
  let localPreamble: ReturnType<typeof parsePreambleDateTime> | null = null;
  let zuluPreamble: ReturnType<typeof parsePreambleDateTime> | null = null;
  for await (let line of logfileIterator(logfile)) {
    //First, validate. The first line should be what we expecte, otherwise abort
    if (!isValid) {
      if (line === FIRST_LINE_VALIDATION) {
        isValid = true;
      } else {
        // TODO: Handle error better than just returning null;
        console.error("Parsing failed. Invalid file.");
        return null;
      }
    }

    // Second, we expect some preamble data. Check for known fields. Stop when we reach CSV headers
    if (line.indexOf(CSV_HEADER_PREFIX) === 0) {
      parsedPreamble = true;
    }

    // Preamble
    if (!parsedPreamble) {
      const preambleLine = line.split(": ");
      // If we don't have a key-value pair in a format we expect, just ignore the line
      if (preambleLine.length === 2) {
        // Remove trailing periods from field name
        const name = preambleLine[0].replace(/\./g, "");
        const value = preambleLine[1];

        parsedLogfile.preamble[name] = value;
      }
      continue;
    }

    // Set up starting time point. Measure in unix timestamps
    if (parsedPreamble && !parsedDatasetHeaders) {
      localPreamble = parsePreambleDateTime(
        parsedLogfile.preamble["Local Time"]
      );
      zuluPreamble = parsePreambleDateTime(parsedLogfile.preamble["Zulu Time"]);

      // Fallback: if we can't parse TIME values per-row, advance by logging interval
      const formattedLocalDate = parsedLogfile.preamble["Local Time"]
        ?.replaceAll("/", "-")
        .trim();
      const formattedZuluDate = parsedLogfile.preamble["Zulu Time"]
        ?.replaceAll("/", "-")
        .trim();
      if (formattedLocalDate) {
        xValue = new Date(formattedLocalDate).getTime();
      } else {
        xValue = new Date(`${formattedZuluDate ?? 0}Z`).getTime();
      }
      xValueIncrement =
        1000 *
        parseFloat(parsedLogfile.preamble["Data Logging Interval"] ?? "1");
    }

    // CSV Data
    let csvLine = line.split(",");
    if (!parsedDatasetHeaders) {
      // First line.. parse headers
      csvLine.forEach((header, index) => {
        const normalized = header.trim();
        if (normalized === "TIME") {
          timeColumnIndex = index;
        }
        parsedLogfile.datasets.push({ label: header, data: [] });
      });
      parsedDatasetHeaders = true;
    } else {
      // CSV Data, same order as headers
      if (csvLine.length !== parsedLogfile.datasets.length) {
        console.error(
          "Data error: Number of headers doesn't equal number of data columns"
        );
      }

      const timeValueRaw =
        timeColumnIndex >= 0 ? csvLine[timeColumnIndex]?.trim() : null;
      const timeSeconds = timeValueRaw
        ? parseTimeToSeconds(timeValueRaw)
        : null;

      if (timeSeconds !== null) {
        if (timeMode === "unknown") {
          const localSeconds = localPreamble?.timeSeconds ?? null;
          const zuluSeconds = zuluPreamble?.timeSeconds ?? null;

          if (localPreamble) {
            // Default to local time when available
            timeMode = "local";
          } else if (zuluPreamble) {
            timeMode = "utc";
          } else if (localSeconds !== null && timeSeconds === localSeconds) {
            timeMode = "local";
          } else if (zuluSeconds !== null && timeSeconds === zuluSeconds) {
            timeMode = "utc";
          }

          if (timeMode === "local" && localPreamble) {
            currentDateParts = { ...localPreamble.date };
          } else if (timeMode === "utc" && zuluPreamble) {
            currentDateParts = { ...zuluPreamble.date };
          }
        }

        if (currentDateParts) {
          if (
            lastTimeSeconds !== null &&
            timeSeconds + 60 < lastTimeSeconds
          ) {
            // Clock wrapped past midnight
            const rollover = new Date(
              currentDateParts.year,
              currentDateParts.month - 1,
              currentDateParts.day
            );
            rollover.setDate(rollover.getDate() + 1);
            currentDateParts = {
              year: rollover.getFullYear(),
              month: rollover.getMonth() + 1,
              day: rollover.getDate(),
            };
            sameSecondCount = 0;
          }

          if (lastTimeSeconds !== null && timeSeconds === lastTimeSeconds) {
            sameSecondCount += 1;
          } else {
            sameSecondCount = 0;
          }

          const [h, m, s] = secondsToHms(timeSeconds);
          const baseTimeMs =
            timeMode === "utc"
              ? Date.UTC(
                  currentDateParts.year,
                  currentDateParts.month - 1,
                  currentDateParts.day,
                  h,
                  m,
                  s
                )
              : new Date(
                  currentDateParts.year,
                  currentDateParts.month - 1,
                  currentDateParts.day,
                  h,
                  m,
                  s
                ).getTime();
          const subSecondOffsetMs = sameSecondCount * xValueIncrement;
          xValue = baseTimeMs + subSecondOffsetMs;

          if (xValueInitial === 0) {
            xValueInitial = xValue;
          }
          lastTimeSeconds = timeSeconds;
        }
      }

      if (timeSeconds === null || !currentDateParts) {
        // Fallback to interval-based timing
        if (xValueInitial === 0) {
          xValueInitial = xValue;
        }
      }

      csvLine.forEach((datapoint, i) => {
        // TODO: Smart decode data depending on expected format. Fow now, assume everything is a number except first column
        // TODO: Better perf for converting string to num
        parsedLogfile.datasets[i]?.data.push({ x: xValue, y: +datapoint });
      });

      if (timeSeconds === null || !currentDateParts) {
        xValue += xValueIncrement;
      }
    }
  }

  addDerivedFuelSeries(parsedLogfile);

  //Calculated properties
  parsedLogfile.calculated = {
    limits: {
      x: {
        min: xValueInitial,
        max: xValue,
      },
    },
  };

  return parsedLogfile;
};

const parsePreambleDateTime = (value?: string) => {
  if (!value) return null;
  const trimmed = value.trim();
  const match =
    /^(\d{4})[/-](\d{2})[/-](\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})$/.exec(
      trimmed
    );
  if (!match) return null;
  const [, year, month, day, hour, minute, second] = match;
  const timeSeconds =
    Number(hour) * 3600 + Number(minute) * 60 + Number(second);
  return {
    date: {
      year: Number(year),
      month: Number(month),
      day: Number(day),
    },
    timeSeconds,
  };
};

const parseTimeToSeconds = (value: string) => {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? "0");
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds)
  ) {
    return null;
  }
  return hours * 3600 + minutes * 60 + seconds;
};

const secondsToHms = (totalSeconds: number) => {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds] as const;
};

const FUEL_LEFT_LABEL = "FUEL L;GAL";
const FUEL_RIGHT_LABEL = "FUEL R;GAL";
const FUEL_TOTAL_LABEL = "FUEL TOTAL;GAL";
const FUEL_BAL_LABEL = "FUEL BAL;GAL";

const addDerivedFuelSeries = (parsedLogfile: ParsedLogfile) => {
  const left = parsedLogfile.datasets.find(
    (dataset) => dataset.label === FUEL_LEFT_LABEL
  );
  const right = parsedLogfile.datasets.find(
    (dataset) => dataset.label === FUEL_RIGHT_LABEL
  );

  if (!left || !right) return;

  const length = Math.min(left.data.length, right.data.length);
  const totalData = [];
  const balanceData = [];

  for (let i = 0; i < length; i += 1) {
    const leftPoint = left.data[i];
    const rightPoint = right.data[i];
    const leftValue = leftPoint?.y ?? Number.NaN;
    const rightValue = rightPoint?.y ?? Number.NaN;

    totalData.push({
      x: leftPoint?.x ?? rightPoint?.x ?? 0,
      y: leftValue + rightValue,
    });
    balanceData.push({
      x: leftPoint?.x ?? rightPoint?.x ?? 0,
      y: leftValue - rightValue,
    });
  }

  parsedLogfile.datasets.push(
    { label: FUEL_TOTAL_LABEL, data: totalData },
    { label: FUEL_BAL_LABEL, data: balanceData }
  );
};

async function* logfileIterator(logfile: File) {
  // Example from: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStreamDefaultReader
  const utf8Decoder = new TextDecoder("utf-8");
  const reader = logfile.stream().getReader();

  let { value: chunk, done: readerDone } = await reader.read();
  let decodedChunk = chunk ? utf8Decoder.decode(chunk, { stream: true }) : "";

  const re = /\r\n|\n|\r/gm; //Regex to find line break
  let startIndex = 0;

  for (;;) {
    let result = re.exec(decodedChunk);
    if (!result) {
      if (readerDone) {
        break;
      }
      let remainder = decodedChunk.substring(startIndex);
      ({ value: chunk, done: readerDone } = await reader.read());
      decodedChunk =
        remainder + (chunk ? utf8Decoder.decode(chunk, { stream: true }) : "");
      startIndex = re.lastIndex = 0;
      continue;
    }
    yield decodedChunk.substring(startIndex, result.index);
    startIndex = re.lastIndex;
  }
  if (startIndex < decodedChunk.length) {
    // last line didn't end in a newline char
    yield decodedChunk.substring(startIndex);
  }
}

// Arrange parsed log groups into an expected order
export const sortLogGroups = (parsedLogfile: ParsedLogfile): LogGroup[] => {
  const sortedLogGroups: LogGroup[] = [];

  Object.values(LogGroups).forEach((group) => {
    const datasets = parsedLogfile.datasets?.filter(
      (dataset) => KnownLogTypes[dataset.label]?.group === group
    );

    if (datasets) {
      sortedLogGroups.push({ group: LogGroups[group], datasets });
    }
  });

  return sortedLogGroups;
};
