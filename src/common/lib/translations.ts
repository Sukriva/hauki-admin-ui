import { Language, ResourceState, WeekdayTypes } from './types';

const {
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY,
} = WeekdayTypes;

// eslint-disable-next-line @typescript-eslint/naming-convention
const { OPEN, CLOSED, SELF_SERVICE } = ResourceState;

type LanguageTranslations = {
  [x in Language]?: {
    [key: string]: string;
  };
};

export const shortWeekdayTranslations: LanguageTranslations = {
  fi: {
    [MONDAY]: 'ma',
    [TUESDAY]: 'ti',
    [WEDNESDAY]: 'ke',
    [THURSDAY]: 'to',
    [FRIDAY]: 'pe',
    [SATURDAY]: 'la',
    [SUNDAY]: 'su',
  },
};

export const resourceStateTranslations: LanguageTranslations = {
  fi: {
    [OPEN]: 'Avoinna',
    [CLOSED]: 'Suljettu',
    [SELF_SERVICE]: 'Itsepalvelu',
  },
};
