import { writable } from "svelte/store";
import type { LogfileMetadata } from "$lib/cgr30Parse";

export interface FlightFileRecord {
  file: File;
  fileName: string;
  flightNumber: string;
  flightDate: string;
  suffix?: string;
  metadata: LogfileMetadata;
}

export interface FlightGroup {
  id: string;
  flightNumber: string;
  flightDate: string;
  aircraftId?: string;
  files: FlightFileRecord[];
  primaryHeader?: string[];
  preamble?: LogfileMetadata["preamble"];
}

export const flightStore = writable<FlightGroup[]>([]);
export const selectedFlightId = writable<string | null>(null);
