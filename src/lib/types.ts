export interface Dataset {
  label: string;
  data: { x: number; y: number }[];
}

export interface LogFilePreambleFields {
  ident?: string;
  unitId?: string;
  edcModels?: string;
  softwareVersion?: string;
  trackingNumber?: string;
  localTime?: string;
  zuluTime?: string;
  flightNumber?: string;
  engineHours?: string;
  tachTime?: string;
  dataLoggingInterval?: string;
}

// Map names from logfile to type
export const KnownPreambleFields: {
  [key: string]: keyof LogFilePreambleFields;
} = {
  "Aircraft ID": "ident",
  "Unit ID": "unitId",
  "EDC Models": "edcModels",
  "SW Version": "softwareVersion",
  "Tracking Number": "trackingNumber",
  "Local Time": "localTime",
  "Zulu Time": "zuluTime",
  "Flight Number": "flightNumber",
  "Engine Hours": "engineHours",
  "Tach Time": "tachTime",
  "Data Logging Interval": "dataLoggingInterval",
};

export interface ParsedLogfile extends LogFilePreambleFields {
  datasets?: Dataset[];
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

// Groups will be displayed in the order defined here
export enum LogGroups {
  rpm = "rpm",
  fuelFlow = "fuelFlow",
  egt = "egt",
  cht = "cht",
  oilTemp = "oilTemp",
  oilPressure = "oilPressure",
  electrical = "electrical",
  fuelLevels = "fuelLevels",
}

export interface LogGroup {
  group: LogGroups;
  datasets: Dataset[];
}

export const LogGroupInfo: {
  [key in LogGroups]: {
    title: string;
    limits: { y: { min: number; max: number } };
  };
} = {
  [LogGroups.rpm]: { title: "RPM", limits: { y: { min: 0, max: 3000 } } },
  [LogGroups.fuelFlow]: {
    title: "Fuel Flow",
    limits: { y: { min: 0, max: 20 } },
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
  [LogGroups.fuelLevels]: {
    title: "Fuel Levels",
    limits: { y: { min: 0, max: 25 } },
  },
};

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
    group: LogGroups.oilPressure,
  },

  "OIL P;PSI": { prettyLabel: "Oil Pressure (PSI)", group: LogGroups.oilTemp },

  "VOLTS;V": { prettyLabel: "Volts (V)", group: LogGroups.electrical },
  "AMPS;A": { prettyLabel: "Amps (A)", group: LogGroups.electrical },

  "FUEL L;GAL": { prettyLabel: "Left Tank (Gal)", group: LogGroups.fuelLevels },
  "FUEL R;GAL": {
    prettyLabel: "Right Tank (Gal)",
    group: LogGroups.fuelLevels,
  },
};
