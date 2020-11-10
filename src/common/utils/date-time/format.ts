export const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString();

export const formatDateRange = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}): string => {
  const isSingleDate: boolean = !endDate || startDate === endDate;
  const formattedStartDate: string = formatDate(startDate);
  if (isSingleDate) {
    return formattedStartDate;
  }
  return `${formattedStartDate}-${formatDate(endDate)}`;
};

export const formatTime = (time: string | null): string => {
  if (!time) {
    return '';
  }
  const [hours, minutes] = time.split(':');
  const hourWithoutLeadingZero: string = hours.startsWith('0')
    ? hours.charAt(1)
    : hours;
  return `${hourWithoutLeadingZero}:${minutes}`;
};
