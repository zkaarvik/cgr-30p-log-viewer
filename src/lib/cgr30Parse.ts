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
  const parsedLogfile: ParsedLogfile = { calculated: { xMin: 0, xMax: 0 } };

  // Validate.. Expect first line to read "Electronics International Inc"
  let isValid = false;
  let parsedPreamble = false;
  let parsedDatasetHeaders = false;
  let xValue = 0;
  let xValueInitial = 0;
  let xValueIncrement = 1;
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
        const preambleFieldName = preambleLine[0].replace(/\./g, "");
        const preambleFieldValue = preambleLine[1];
        setPreambleField(parsedLogfile, preambleFieldName, preambleFieldValue);
      }
      continue;
    }

    // Set up starting time point. Measure in unix timestamps
    if (parsedPreamble && !parsedDatasetHeaders) {
      xValue = new Date(`${parsedLogfile.zuluTime ?? 0}Z`).getTime();
      xValueInitial = xValue;
      xValueIncrement =
        1000 * parseFloat(parsedLogfile.dataLoggingInterval ?? "1");
    }

    // CSV Data
    let csvLine = line.split(",");
    if (!parsedDatasetHeaders) {
      // First line.. parse headers
      parsedLogfile.datasets = [];
      csvLine.forEach((header) =>
        parsedLogfile.datasets?.push({ label: header, data: [] })
      );
      parsedDatasetHeaders = true;
    } else {
      // CSV Data, same order as headers
      if (csvLine.length !== parsedLogfile.datasets?.length) {
        console.error(
          "Data error: Number of headers doesn't equal number of data columns"
        );
      }

      csvLine.forEach((datapoint, i) => {
        // TODO: Smart decode data depending on expected format. Fow now, assume everything is a number except first column
        // TODO: Better perf for converting string to num
        parsedLogfile.datasets?.[i]?.data.push({ x: xValue, y: +datapoint });
      });
      xValue += xValueIncrement;
    }
  }

  //Calculated properties
  parsedLogfile.calculated = {
    xMin: xValueInitial,
    xMax: xValue,
  };

  return parsedLogfile;
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

const setPreambleField = (
  parsedLogfile: ParsedLogfile,
  preambleFieldName: string,
  preambleFieldValue: string
) => {
  switch (preambleFieldName) {
    case "Aircraft ID":
      parsedLogfile.ident = preambleFieldValue;
      return;
    case "Unit ID":
      parsedLogfile.unitId = preambleFieldValue;
      return;
    case "EDC Models":
      parsedLogfile.edcModels = preambleFieldValue;
      return;
    case "SW Version":
      parsedLogfile.softwareVersion = preambleFieldValue;
      return;
    case "Tracking Number":
      parsedLogfile.trackingNumber = preambleFieldValue;
      return;
    case "Local Time":
      parsedLogfile.localTime = preambleFieldValue;
      return;
    case "Zulu Time":
      parsedLogfile.zuluTime = preambleFieldValue;
      return;
    case "Flight Number":
      parsedLogfile.flightNumber = preambleFieldValue;
      return;
    case "Engine Hours":
      parsedLogfile.engineHours = preambleFieldValue;
      return;
    case "Tach Time":
      parsedLogfile.tachTime = preambleFieldValue;
      return;
    case "Data Logging Interval":
      parsedLogfile.dataLoggingInterval = preambleFieldValue;
      return;
  }
};

export const sortLogGroups = (parsedLogfile: ParsedLogfile): LogGroups => {
  const xLimits = {
    min: parsedLogfile.calculated.xMin,
    max: parsedLogfile.calculated.xMax,
  };

  // y min/max values should be suggested min/max for the charts. Based on reasonable assumptions for now
  // x min/max values should be calculated time bounds for zooming in/out.
  const logGroups: LogGroups = {
    rpm: {
      datasets: [],
      limits: { x: xLimits, y: { min: 0, max: 3000 } },
    },
    fuelFlow: {
      datasets: [],
      limits: { x: xLimits, y: { min: 0, max: 20 } },
    },
    egt: {
      datasets: [],
      limits: { x: xLimits, y: { min: 0, max: 2000 } },
    },
    cht: {
      datasets: [],
      limits: { x: xLimits, y: { min: 0, max: 1000 } },
    },
    oilTemp: {
      datasets: [],
      limits: { x: xLimits, y: { min: 0, max: 300 } },
    },
    oilPressure: {
      datasets: [],
      limits: { x: xLimits, y: { min: 0, max: 150 } },
    },
    electrical: {
      datasets: [],
      limits: { x: xLimits, y: { min: 0, max: 15 } },
    },
    fuelLevels: {
      datasets: [],
      limits: { x: xLimits, y: { min: 0, max: 25 } },
    },
  };

  parsedLogfile.datasets?.forEach((dataset) => {
    switch (dataset.label) {
      case "RPMLEFT;RPM":
      case "RPMRIGHT;RPM":
        logGroups.rpm.datasets.push(dataset);
        break;
      case "FLOW;GPH":
        logGroups.fuelFlow.datasets.push(dataset);
        break;
      case "EGT1;*F":
      case "EGT2;*F":
      case "EGT3;*F":
      case "EGT4;*F":
        logGroups.egt.datasets.push(dataset);
        break;
      case "CHT1;*F":
      case "CHT2;*F":
      case "CHT3;*F":
      case "CHT4;*F":
        logGroups.cht.datasets.push(dataset);
        break;
      case "OIL T;*F":
        logGroups.oilTemp.datasets.push(dataset);
        break;
      case "OIL P;PSI":
        logGroups.oilPressure.datasets.push(dataset);
        break;
      case "VOLTS;V":
      case "AMPS;A":
        logGroups.electrical.datasets.push(dataset);
        break;
      case "FUEL L;GAL":
      case "FUEL R;GAL":
        logGroups.fuelLevels.datasets.push(dataset);
        break;
    }
  });

  return logGroups;
};
