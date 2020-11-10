import { Language, Weekdays, WeekdayTypes } from '../../lib/types';
import { shortWeekdayTranslations } from '../../lib/translations';

const weekdaySpansToRanges = (weekdays: Weekdays): number[][] => {
  if (!weekdays || weekdays.length === 0) {
    return [];
  }

  const dayRangeSets: number[][] = weekdays
    .sort()
    .reduce((acc: number[][], current: WeekdayTypes, index: number) => {
      const [last, ...rest] = acc.reverse();
      if (index === 0) {
        return [...acc, [current]];
      }
      const previousExists: boolean = last && last.includes(current - 1);

      if (previousExists) {
        return [...rest.sort(), [...last, current]];
      }
      return [...acc, [current]];
    }, [])
    .filter((i) => !!i)
    .sort();

  return dayRangeSets.map((set) => {
    if (set.length === 1 || set.length === 2) {
      return set;
    }
    const [first] = set;
    const [last] = set.reverse();
    return [first, last];
  });
};

const getWeekdayTranslation = (
  language: Language,
  key: number
): string | undefined => shortWeekdayTranslations[language]?.[key];

export default function weekdaySpansToText(
  weekdaySpans: Weekdays,
  language: Language = 'fi'
): string {
  const weekDayRanges: number[][] = weekdaySpansToRanges(weekdaySpans);

  return weekDayRanges
    .map((range: number[]) => {
      if (weekDayRanges.length === 1) {
        return getWeekdayTranslation(language, range[0]);
      }
      return `${getWeekdayTranslation(
        language,
        range[0]
      )} - ${getWeekdayTranslation(language, range[1])}`;
    })
    .join(', ');
}
