import type { PageLoad } from "./$types";
import {
  mergeParsedLogfiles,
  parseLogfile,
  type ParseLogfileOptions,
} from "$lib/cgr30Parse.js";
import { flightStore, selectedFlightId } from "$lib/stores/flightStore";
import { get } from "svelte/store";

export const load: PageLoad = async ({ params }) => {
  const flights = get(flightStore);
  const flightId = get(selectedFlightId);
  const flight = flights.find((candidate) => candidate.id === flightId);
  if (!flight) {
    return { parsedLogfile: null, flight: null };
  }

  const preambleFallback = flight.preamble ?? {};
  const headerFallback = flight.primaryHeader ?? null;
  const parsedParts = [];

  for (const fileRecord of flight.files) {
    const options: ParseLogfileOptions = { allowMissingValidation: true };
    if (headerFallback && !fileRecord.metadata.hasHeader) {
      options.headerOverride = headerFallback;
    }
    if (
      Object.keys(preambleFallback).length > 0 &&
      !fileRecord.metadata.hasPreamble
    ) {
      options.preambleOverride = preambleFallback;
    }

    const parsed = await parseLogfile(fileRecord.file, options);
    if (parsed) {
      parsedParts.push(parsed);
    }
  }

  const merged = mergeParsedLogfiles(parsedParts);
  if (merged) {
    if (flight.aircraftId && !merged.preamble["Aircraft ID"]) {
      merged.preamble["Aircraft ID"] = flight.aircraftId;
    }
    if (!merged.preamble["Flight Number"]) {
      merged.preamble["Flight Number"] = flight.flightNumber;
    }
    if (!merged.preamble["Flight Date"]) {
      merged.preamble["Flight Date"] = flight.flightDate;
    }
  }

  return { parsedLogfile: merged, flight };
};
