import isBefore from 'date-fns/isBefore';

// eslint-disable-next-line import/prefer-default-export
export function isDateBefore(dateA: Date, dateB: Date): boolean {
  return isBefore(dateA, dateB);
}
