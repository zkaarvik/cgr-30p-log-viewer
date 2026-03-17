import { parseLogfileMetadata, type LogfileMetadata } from "$lib/cgr30Parse";
import type { FlightFileRecord, FlightGroup } from "$lib/stores/flightStore";

const FILENAME_REGEX = /^Flt(\d+)_([0-9]{8})([A-Za-z])?\.csv$/i;

export const parseFlightFilename = (name: string) => {
  const match = FILENAME_REGEX.exec(name);
  if (!match) return null;
  const flightNumber = match[1];
  const dateRaw = match[2];
  const suffix = match[3]?.toUpperCase();
  const flightDate = `${dateRaw.slice(0, 4)}-${dateRaw.slice(
    4,
    6
  )}-${dateRaw.slice(6, 8)}`;
  return { flightNumber, flightDate, suffix };
};

export const buildFlightGroups = async (
  files: File[]
): Promise<FlightGroup[]> => {
  const records: FlightFileRecord[] = [];

  for (const file of files) {
    const parsedName = parseFlightFilename(file.name);
    if (!parsedName) continue;
    const metadata: LogfileMetadata = await parseLogfileMetadata(file);
    records.push({
      file,
      fileName: file.name,
      flightNumber: parsedName.flightNumber,
      flightDate: parsedName.flightDate,
      suffix: parsedName.suffix,
      metadata,
    });
  }

  const grouped = new Map<string, FlightGroup>();

  for (const record of records) {
    const aircraftId = record.metadata.preamble["Aircraft ID"];
    const key = `${record.flightNumber}-${record.flightDate}-${
      aircraftId ?? "unknown"
    }`;
    const existing = grouped.get(key);
    if (existing) {
      existing.files.push(record);
      if (!existing.aircraftId) {
        existing.aircraftId = record.metadata.preamble["Aircraft ID"];
      }
      if (!existing.primaryHeader && record.metadata.header) {
        existing.primaryHeader = record.metadata.header;
      }
      if (
        (!existing.preamble || Object.keys(existing.preamble).length === 0) &&
        record.metadata.hasPreamble
      ) {
        existing.preamble = record.metadata.preamble;
      }
      continue;
    }

    grouped.set(key, {
      id: "",
      flightNumber: record.flightNumber,
      flightDate: record.flightDate,
      aircraftId,
      files: [record],
      primaryHeader: record.metadata.header ?? undefined,
      preamble: record.metadata.hasPreamble ? record.metadata.preamble : undefined,
    });
  }

  const groups = Array.from(grouped.values());

  const unknownGroups = groups.filter((group) => !group.aircraftId);
  for (const unknown of unknownGroups) {
    const matches = groups.filter(
      (group) =>
        group !== unknown &&
        group.flightNumber === unknown.flightNumber &&
        group.flightDate === unknown.flightDate &&
        group.aircraftId
    );
    if (matches.length === 1) {
      const target = matches[0];
      target.files.push(...unknown.files);
      if (!target.primaryHeader && unknown.primaryHeader) {
        target.primaryHeader = unknown.primaryHeader;
      }
      if (!target.preamble && unknown.preamble) {
        target.preamble = unknown.preamble;
      }
      groups.splice(groups.indexOf(unknown), 1);
    }
  }

  const finalized = groups.map((group) => ({
    ...group,
    id: `${group.aircraftId ?? "unknown"}_${group.flightNumber}_${
      group.flightDate
    }`,
  }));

  finalized.sort((a, b) => b.flightDate.localeCompare(a.flightDate));
  return finalized;
};
