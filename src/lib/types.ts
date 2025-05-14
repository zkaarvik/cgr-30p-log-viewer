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
