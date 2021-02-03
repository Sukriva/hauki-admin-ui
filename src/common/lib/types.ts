export enum Language {
  FI = 'fi',
  SV = 'sv',
  EN = 'en',
}

export type LanguageOption = {
  label: string;
  value: Language;
};

export type LanguageStrings = {
  [x in Language]: string | null;
};

export enum ResourceState {
  OPEN = 'open',
  SELF_SERVICE = 'self_service',
  CLOSED = 'closed',
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
  start_time: string | null;
  end_time: string | null;
  weekdays: Weekdays | null;
  id?: number;
  created?: string;
  modified?: string;
  is_removed?: boolean;
  name?: LanguageStrings;
  description?: LanguageStrings;
  full_day?: boolean;
  resource_state?: ResourceState;
  group?: number;
};

export type FormWeekdays = [
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean,
  boolean
];

export type TimeSpanFormFormat = {
  id?: string;
  group?: string;
  description: string;
  endTime: string;
  startTime: string;
  resourceState?: ResourceState;
  weekdays: FormWeekdays;
};

export type ApiChoice = {
  value: string;
  display_name: string | LanguageStrings;
};

export type InputOption = {
  label: string;
  value: string;
};

export type TextFieldConfig = {
  max_length?: number;
};

export type DatePeriodOptions = {
  actions: {
    POST: {
      name: TextFieldConfig;
      resource_state: {
        choices: ApiChoice[];
      };
      time_span_groups: {
        child: {
          children: {
            rules: {
              child: {
                children: {
                  context: {
                    choices: ApiChoice[];
                  };
                  frequency_modifier: {
                    choices: ApiChoice[];
                  };
                  subject: {
                    choices: ApiChoice[];
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};

export type UiFieldConfig = {
  options: InputOption[];
};

export type UiRuleConfig = {
  context: UiFieldConfig;
  subject: UiFieldConfig;
  frequencyModifier: UiFieldConfig;
};

export type UiDatePeriodConfig = {
  name: TextFieldConfig;
  resourceState: UiFieldConfig;
  timeSpanGroup: {
    rule: UiRuleConfig;
  };
};

export type Frequency = {
  frequency_ordinal: number | null;
  frequency_modifier: string | null;
};

interface BaseGroupRule extends Frequency {
  context: string;
  subject: string;
}

export interface GroupRule extends BaseGroupRule {
  id?: number;
  group?: number;
  name?: LanguageStrings;
  description?: LanguageStrings;
  created?: string;
  modified?: string;
  start: number;
}

export interface GroupRuleFormFormat extends BaseGroupRule {
  id?: string;
  group?: string;
  start: string;
}

export interface TimeSpanGroup {
  id?: number;
  period?: number;
  time_spans: TimeSpan[];
  rules: GroupRule[];
}

export interface TimeSpanGroupFormFormat {
  id?: string;
  period?: string;
  timeSpans: TimeSpanFormFormat[] | {}[];
  rules: GroupRuleFormFormat[];
}

export type DatePeriod = {
  id?: number;
  created?: string;
  modified?: string;
  is_removed?: boolean;
  name: LanguageStrings;
  description: LanguageStrings;
  start_date?: string;
  end_date?: string;
  resource_state?: ResourceState;
  override: boolean;
  resource: number;
  time_span_groups: TimeSpanGroup[];
};

export interface Resource {
  id: number;
  name: {
    fi: string;
    sv: string;
    en: string;
  };
  description: {
    fi: string;
    sv: string;
    en: string;
  };
  address: {
    fi: string;
    sv: string;
    en: string;
  };
  extra_data: {
    citizen_url: string;
    admin_url: string;
  };
  children: number[];
  parents: number[];
}
