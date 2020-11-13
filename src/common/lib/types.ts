export type Language = 'fi' | 'sv' | 'en';

export type LanguageOption = {
  label: string;
  value: Language;
};

export type LanguageStrings = {
  [x in Language]: string | null;
};

enum ResourceState {
  OPEN = 'open',
  SELF_SERVICE = 'self_service',
  CLOSED = 'closed',
}

enum WeekdayTypes {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

type Weekdays = Array<WeekdayTypes>;

type TimeSpan = {
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

type TimeSpanGroup = {
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
