// ADDING NEW LOG GROUPS:
// Define the new group in LogGroups, and the associated chart partameters in LogGroupInfo
// Each group corresponds to one chart
// Groups will be displayed in the order defined here
export enum LogGroups {
  rpm = "rpm",
  egt = "egt",
  cht = "cht",
  oilTemp = "oilTemp",
  oilPressure = "oilPressure",
  electrical = "electrical",
  fuelFlow = "fuelFlow",
  fuelLevels = "fuelLevels",
  otherTemps = "otherTemps",
}

export const LogGroupInfo: {
  [key in LogGroups]: {
    title: string;
    limits: { y: { min: number; max: number } };
  };
} = {
  [LogGroups.rpm]: {
    title: "RPM",
    limits: { y: { min: 0, max: 3000 } },
  },
  [LogGroups.egt]: {
    title: "Exhaust Gas Temperature (EGT)",
    limits: { y: { min: 0, max: 2000 } },
  },
  [LogGroups.cht]: {
    title: "Cylinder Head Temperature (CHT)",
    limits: { y: { min: 0, max: 1000 } },
  },
  [LogGroups.oilTemp]: {
    title: "Oil Temperature",
    limits: { y: { min: 0, max: 300 } },
  },
  [LogGroups.oilPressure]: {
    title: "Oil Pressure",
    limits: { y: { min: 0, max: 150 } },
  },
  [LogGroups.electrical]: {
    title: "Electrical System",
    limits: { y: { min: 0, max: 15 } },
  },
  [LogGroups.fuelFlow]: {
    title: "Fuel Flow",
    limits: { y: { min: 0, max: 20 } },
  },
  [LogGroups.fuelLevels]: {
    title: "Fuel Levels",
    limits: { y: { min: 0, max: 25 } },
  },
  [LogGroups.otherTemps]: {
    title: "Other Temperatures",
    limits: { y: { min: -20, max: 50 } },
  },
};

// ADDING NEW LOGGED COLUMNS:
// Add new logged parameters we want to display here. Each of these should correspond to a column in the CSV
export const KnownLogTypes: {
  [key: string]: { prettyLabel: string; group: LogGroups };
} = {
  "RPMLEFT;RPM": { prettyLabel: "RPM Left", group: LogGroups.rpm },
  "RPMRIGHT;RPM": { prettyLabel: "RPM Right", group: LogGroups.rpm },

  "FLOW;GPH": { prettyLabel: "Fuel Flow (GPH)", group: LogGroups.fuelFlow },

  "EGT1;*F": { prettyLabel: "EGT 1 (°F)", group: LogGroups.egt },
  "EGT2;*F": { prettyLabel: "EGT 2 (°F)", group: LogGroups.egt },
  "EGT3;*F": { prettyLabel: "EGT 3 (°F)", group: LogGroups.egt },
  "EGT4;*F": { prettyLabel: "EGT 4 (°F)", group: LogGroups.egt },

  "CHT1;*F": { prettyLabel: "CHT 1 (°F)", group: LogGroups.cht },
  "CHT2;*F": { prettyLabel: "CHT 2 (°F)", group: LogGroups.cht },
  "CHT3;*F": { prettyLabel: "CHT 3 (°F)", group: LogGroups.cht },
  "CHT4;*F": { prettyLabel: "CHT 4 (°F)", group: LogGroups.cht },

  "OIL T;*F": {
    prettyLabel: "Oil Temperature (°F)",
    group: LogGroups.oilTemp,
  },

  "OIL P;PSI": {
    prettyLabel: "Oil Pressure (PSI)",
    group: LogGroups.oilPressure,
  },

  "VOLTS;V": { prettyLabel: "Volts (V)", group: LogGroups.electrical },
  "AMPS;A": { prettyLabel: "Amps (A)", group: LogGroups.electrical },

  "FUEL L;GAL": { prettyLabel: "Left Tank (Gal)", group: LogGroups.fuelLevels },
  "FUEL R;GAL": {
    prettyLabel: "Right Tank (Gal)",
    group: LogGroups.fuelLevels,
  },
  "FLIGHT;GAL": {
    prettyLabel: "Fuel Used (Gal)",
    group: LogGroups.fuelLevels,
  },

  "CARB T;*C": {
    prettyLabel: "Carb Temperature (°C)",
    group: LogGroups.otherTemps,
  },
  "OAT;*C": {
    prettyLabel: "Outside Air Temperature (°C)",
    group: LogGroups.otherTemps,
  },
};

// OTHER TYPES
export interface Dataset {
  label: string;
  data: { x: number; y: number }[];
}

export interface ParsedLogfile {
  // Preamble is the file information before the CSV data
  preamble: {
    [key: string]: string;
  };
  datasets: Dataset[];
  // Calculated properties not directly from logfile
  calculated: {
    limits: {
      x: {
        min: number;
        max: number;
      };
    };
  };
}

export interface LogGroup {
  group: LogGroups;
  datasets: Dataset[];
}
