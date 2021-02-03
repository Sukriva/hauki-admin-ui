// Based on: https://github.com/City-of-Helsinki/palvelutarjotin-admin/blob/release-0.1.0/src/common/components/datepicker/Datepicker.tsx
import {
  OnDatesChangeProps,
  START_DATE,
  useDatepicker,
} from '@datepicker-react/hooks';
import formatDate from 'date-fns/format';
import isValidDate from 'date-fns/isValid';
import parseDate from 'date-fns/parse';
import { IconAngleLeft, IconAngleRight, IconCalendarPlus } from 'hds-react';
import uniqueId from 'lodash/uniqueId';
import React, { useState } from 'react';
import fiLocale from 'date-fns/locale/fi';
import InputWrapper from './InputWrapper';
import './Datepicker.scss';
import './InputWrapper.scss';
import DatepickerContext from './datepickerContext';
import Month from './Month';
import MonthNavButton from './MonthNavButton';
import TimesList from './TimesList';
import {
  dateFormFormat,
  datetimeFormFormat,
} from '../../common/utils/date-time/format';

function generateUniqueId(prefix = 'datepicker-id'): string {
  return `${prefix}-${uniqueId()}`;
}

const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
const datetimeRegex = /^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/;

type TimeObject = { hours: number; minutes: number };

export type DatepickerError = {
  type: string;
  text?: string;
};

function getTimeObjects(interval = 15): TimeObject[] {
  const times: TimeObject[] = [];

  for (let h = 0; h < 24; h += 1) {
    for (let m = 0; m < 60; m += interval) {
      times.push({ hours: h, minutes: m });
    }
  }

  return times;
}

export type DatepickerProps = {
  className?: string;
  dataTest?: string;
  disabled?: boolean;
  helperText?: string;
  id: string;
  error?: DatepickerError;
  labelText?: string;
  onBlur?: () => void;
  onChange: (value?: Date | null) => void;
  value: Date | null;
  timeSelector?: boolean;
  minuteInterval?: number;
  hideLabel?: boolean;
  required?: boolean;
  registerFn: Function;
  customValidations?: {
    [key: string]: (date: string | null) => boolean | string;
  };
};

const Datepicker: React.FC<DatepickerProps> = ({
  className,
  dataTest,
  value,
  id,
  helperText,
  error,
  labelText,
  onChange,
  onBlur,
  timeSelector,
  minuteInterval,
  hideLabel,
  required,
  registerFn,
  customValidations,
}) => {
  const [times] = useState(() =>
    getTimeObjects(minuteInterval || minuteInterval)
  );
  const [dateValue, setDateValue] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const datepickerClicked = React.useRef<boolean>(false);
  const container = React.useRef<HTMLDivElement>(null);
  const closeButton = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const datepickerContainer = React.useRef<HTMLDivElement>(null);
  const timesContainer = React.useRef<HTMLDivElement>(null);
  const dialogLabelId = React.useMemo(
    () => generateUniqueId('dialog-label'),
    []
  );

  // Update formatted input string when date value changes
  React.useEffect(() => {
    if (!value) {
      setDateValue('');
    } else if (value && isValidDate(value)) {
      if (timeSelector) {
        const formattedDate = formatDate(value, datetimeFormFormat);
        setDateValue(formattedDate);
      } else {
        const formattedDate = formatDate(value, dateFormFormat);
        setDateValue(formattedDate);
      }
    }
  }, [timeSelector, value]);

  const ensureCalendarIsClosed = React.useCallback(() => {
    if (isCalendarOpen) {
      setIsCalendarOpen(false);
      if (onBlur) {
        onBlur();
      }
    }
  }, [isCalendarOpen, onBlur]);

  const ensureCalendarIsOpen = React.useCallback(() => {
    if (!isCalendarOpen) {
      setIsCalendarOpen(true);
    }
  }, [isCalendarOpen]);

  const isComponentFocused = (): boolean => {
    const { activeElement } = document;

    return !!container.current?.contains(activeElement);
  };

  const handleDocumentKeyDown = (event: KeyboardEvent): void => {
    if (!isComponentFocused()) return;

    switch (event.key) {
      case 'Escape':
        ensureCalendarIsClosed();
        break;
      case 'ArrowDown':
        ensureCalendarIsOpen();
        break;
      default:
        break;
    }
  };

  const onDocumentClick = (): void => {
    if (!isComponentFocused() && !datepickerClicked.current) {
      ensureCalendarIsClosed();
    }
    datepickerClicked.current = false;
  };

  const onDocumentFocusin = (): void => {
    if (!isComponentFocused()) {
      ensureCalendarIsClosed();
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', handleDocumentKeyDown);
    document.addEventListener('focusin', onDocumentFocusin);

    return (): void => {
      document.removeEventListener('click', onDocumentClick);
      document.removeEventListener('keydown', handleDocumentKeyDown);
      document.removeEventListener('focusin', onDocumentFocusin);
    };
  });

  const setNewDateWithTime = (previousDate: Date, newDate: Date): void => {
    const hours = previousDate.getHours();
    const minutes = previousDate.getMinutes();
    const date = new Date(newDate);
    date.setMinutes(minutes);
    date.setHours(hours);
    onChange(date);
  };

  const handleDateChange = (data: OnDatesChangeProps): void => {
    if (!timeSelector) {
      setIsCalendarOpen(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }

    if (value && data.startDate) {
      setNewDateWithTime(value, data.startDate);
    } else if (data.startDate) {
      onChange(data.startDate);
    } else {
      onChange(null);
    }
  };

  const preventArrowKeyScroll = (
    event: React.KeyboardEvent<HTMLDivElement>
  ): void => {
    // eslint-disable-next-line default-case
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        break;
    }
  };

  const toggleCalendar = (): void => {
    if (isCalendarOpen) {
      ensureCalendarIsClosed();
    } else {
      ensureCalendarIsOpen();
    }
  };

  const handleInputFocus = (): void => {
    if (!isCalendarOpen) {
      setIsCalendarOpen(true);
    } else {
      setIsCalendarOpen(false);
    }
  };

  const handleChange = (changedValue: string): void => {
    const parsedDate = parseDate(changedValue, dateFormFormat, new Date());
    if (isValidDate(parsedDate)) {
      onChange(parsedDate);
    }
  };

  const dateIsInValidFormat = (
    parsedDate: Date,
    inputValue: string
  ): boolean => {
    const isParsedDateValid =
      isValidDate(parsedDate) && parsedDate.getFullYear() > 1970;
    if (timeSelector) {
      return isParsedDateValid && datetimeRegex.test(inputValue);
    }
    return isParsedDateValid && dateRegex.test(inputValue);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const eventValue = event.target.value;
    const dateFormat2 = timeSelector ? datetimeFormFormat : dateFormFormat;
    const parsedDate = parseDate(event.target.value, dateFormat2, new Date());
    setDateValue(eventValue);

    if (dateIsInValidFormat(parsedDate, eventValue)) {
      onChange(parsedDate);
    } else {
      onChange(null);
    }
  };

  const handleInputBlur = (): void => {
    handleChange(dateValue);

    if (!isCalendarOpen) {
      setTimeout(() => onBlur && onBlur());
    }
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === 'Enter') {
      handleChange(dateValue);
    }
  };

  const handleTimeClick = React.useCallback(
    (time: TimeObject): void => {
      let newDate: Date;
      if (value) {
        newDate = new Date(value);
      } else {
        newDate = new Date();
      }
      newDate.setHours(time.hours);
      newDate.setMinutes(time.minutes);
      onChange(newDate);
      ensureCalendarIsClosed();
      // focus input for screen readers
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    [ensureCalendarIsClosed, onChange, value]
  );

  const {
    firstDayOfWeek,
    activeMonths: [activeMonth],
    isDateSelected,
    isDateHovered,
    isFirstOrLastSelectedDate,
    isDateBlocked,
    isDateFocused,
    focusedDate,
    onDateHover,
    onDateSelect,
    onDateFocus,
    goToPreviousMonths,
    goToNextMonths,
  } = useDatepicker({
    startDate: isValidDate(value) ? value : new Date(),
    endDate: isValidDate(value) ? value : new Date(),
    focusedInput: START_DATE,
    onDatesChange: handleDateChange,
    numberOfMonths: 1,
    minBookingDate: new Date(),
  });

  const { month, year } = activeMonth;

  return (
    <DatepickerContext.Provider
      value={{
        focusedDate,
        isDateFocused,
        isDateSelected,
        isDateHovered,
        isDateBlocked,
        isFirstOrLastSelectedDate,
        onDateSelect,
        onDateFocus,
        onDateHover,
        selectedDate: value,
      }}>
      <div
        role="button"
        tabIndex={0}
        data-test={dataTest}
        ref={container}
        onKeyDown={preventArrowKeyScroll}
        onClick={(): void => {
          // prevent datepicker closing when clicking inside
          datepickerClicked.current = true;
          setTimeout(() => {
            datepickerClicked.current = false;
          });
        }}
        className="datepickerWrapper">
        <InputWrapper
          className={className}
          id={id}
          helperText={error?.text ?? helperText}
          invalid={!!error}
          labelText={labelText}
          hideLabel={hideLabel}
          hasIcon
          required={required}>
          <input
            name={id}
            id={id}
            ref={(ref): void => {
              registerFn(ref, {
                required,
                ...(customValidations ? { validate: customValidations } : {}),
              });
            }}
            className={
              error
                ? 'hds-text-input__input datepickerInput invalid'
                : 'hds-text-input__input datepickerInput'
            }
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            value={dateValue}
            onKeyDown={handleInputKeyDown}
          />
          <button
            type="button"
            onClick={toggleCalendar}
            aria-label="Kalenteri"
            className="iconCalendar">
            <IconCalendarPlus
              aria-hidden="true"
              size="s"
              className="datepicker-calendar-icon"
            />
          </button>
          {isCalendarOpen && (
            <div
              className="datepickerContainer"
              data-test="datepickerContainer"
              ref={datepickerContainer}
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogLabelId}>
              <p className="sr-only" aria-live="polite">
                {labelText}
              </p>
              <div className="selectorsWrapper">
                <div>
                  <div className="monthNavigation">
                    <MonthNavButton
                      onClick={goToPreviousMonths}
                      aria-label="Edellinen kuukausi">
                      <IconAngleLeft />
                    </MonthNavButton>
                    <div
                      className="currentMonth"
                      aria-live="polite"
                      id={dialogLabelId}>
                      {formatDate(new Date(year, month), 'LLLL yyyy', {
                        locale: fiLocale,
                      })}
                    </div>
                    <MonthNavButton
                      dataTest="show-next-month-button"
                      onClick={goToNextMonths}
                      aria-label="Seuraava kuukausi">
                      <IconAngleRight />
                    </MonthNavButton>
                  </div>
                  <div className="daysContainer">
                    <Month
                      key={`${year}-${month}`}
                      year={year}
                      month={month}
                      firstDayOfWeek={firstDayOfWeek}
                    />
                  </div>
                  <button
                    ref={closeButton}
                    className="closeButton"
                    onClick={ensureCalendarIsClosed}
                    type="button"
                    tabIndex={-1}>
                    Sulje
                  </button>
                </div>
                {timeSelector && (
                  <TimesList
                    times={times}
                    datetime={value}
                    ref={timesContainer}
                    onTimeClick={handleTimeClick}
                  />
                )}
              </div>
            </div>
          )}
        </InputWrapper>
      </div>
    </DatepickerContext.Provider>
  );
};

export default Datepicker;
