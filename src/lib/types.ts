interface Dataset {
  label: string;
  data: string[];
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
}
