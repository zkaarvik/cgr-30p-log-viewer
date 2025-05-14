interface Dataset {
  label: string;
  data: { x: number; y: number }[];
}

interface ParsedLogfile {
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
  datasets?: Dataset[];
  // Calculated properties not directly from logfile
  calculated: {
    xMin: number;
    xMax: number;
  };
}

interface LogGroups {
  rpm: LogGroup;
  fuelFlow: LogGroup;
  egt: LogGroup;
  cht: LogGroup;
  oilTemp: LogGroup;
  oilPressure: LogGroup;
  electrical: LogGroup;
  fuelLevels: LogGroup;
}

interface LogGroup {
  datasets: Dataset[];
  limits?: {
    x: {
      min: number;
      max: number;
    };
    y?: {
      min: number;
      max: number;
    };
  };
}
