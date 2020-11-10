type OptionalText = string | null;

export enum ResourceState {
  OPEN = 'open',
  SELF_SERVICE = 'self_service',
  CLOSED = 'closed',
}

export type Language = 'fi' | 'sv' | 'en';

type LanguageStrings = {
  [x in Language]: string | null;
};

export interface Resource {
  id: string;
  name: LanguageStrings;
  description: LanguageStrings;
  address: LanguageStrings;
  extra_data: {
    citizen_url: string;
    admin_url: string;
  };
}

export enum WeekdayTypes {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

export type Weekdays = Array<WeekdayTypes>;

export type TimeSpan = {
  id: number;
  created: string;
  modified: string;
  is_removed: boolean;
  name: LanguageStrings;
  description: LanguageStrings;
  start_time: string;
  end_time: string;
  full_day: boolean;
  weekdays: Weekdays;
  resource_state: ResourceState;
  group: 1;
};

export type TimeSpanGroup = {
  id: number;
  time_spans: TimeSpan[];
  rules: [];
  period: number;
};

export type DatePeriod = {
  id: string;
  created: string;
  modified: string;
  is_removed: boolean;
  name: LanguageStrings;
  description: LanguageStrings;
  start_date: string;
  end_date: string;
  resource_state: ResourceState;
  override: boolean;
  resource: number;
  time_span_groups: TimeSpanGroup[];
};
