import React from 'react';
import './Weekdays.scss';
import { ArrayField } from 'react-hook-form';
import { TimeSpanFormFormat, FormWeekdays } from '../../common/lib/types';

const DayCheckbox = ({
  register,
  dataTest,
  namePrefix,
  dayIndex,
  weekdays = [],
  children,
}: {
  register: Function;
  dataTest: string;
  namePrefix: string;
  dayIndex: number;
  weekdays?: boolean[];
  children: string;
}): JSX.Element => {
  const checkBoxId = `${namePrefix}[${dayIndex}]`;

  return (
    <label data-test={dataTest} htmlFor={checkBoxId} className="day-label">
      <input
        ref={register()}
        defaultChecked={weekdays[dayIndex] || false}
        type="checkbox"
        name={checkBoxId}
        id={checkBoxId}
        data-test={`${dataTest}-checkbox`}
      />
      <span className="day-option">{children}</span>
    </label>
  );
};

export default function Weekdays({
  namePrefix,
  index,
  register,
  item,
}: {
  namePrefix: string;
  index: number;
  register: Function;
  item: Partial<ArrayField<Record<string, TimeSpanFormFormat>>>;
}): JSX.Element {
  const asWeekdaysValue = (item.weekdays as unknown) as FormWeekdays;
  const weekdaysNamePrefix = `${namePrefix}.weekdays`;

  return (
    <fieldset>
      <legend>Päivät *</legend>
      <DayCheckbox
        weekdays={asWeekdaysValue}
        register={register}
        dataTest={`weekdays-monday-${index}`}
        namePrefix={weekdaysNamePrefix}
        dayIndex={0}>
        Ma
      </DayCheckbox>
      <DayCheckbox
        weekdays={asWeekdaysValue}
        register={register}
        dataTest={`weekdays-tuesday-${index}`}
        namePrefix={weekdaysNamePrefix}
        dayIndex={1}>
        Ti
      </DayCheckbox>
      <DayCheckbox
        weekdays={asWeekdaysValue}
        register={register}
        dataTest={`weekdays-wednesday-${index}`}
        namePrefix={weekdaysNamePrefix}
        dayIndex={2}>
        Ke
      </DayCheckbox>
      <DayCheckbox
        weekdays={asWeekdaysValue}
        register={register}
        dataTest={`weekdays-thursday-${index}`}
        namePrefix={weekdaysNamePrefix}
        dayIndex={3}>
        To
      </DayCheckbox>
      <DayCheckbox
        weekdays={asWeekdaysValue}
        register={register}
        dataTest={`weekdays-friday-${index}`}
        namePrefix={weekdaysNamePrefix}
        dayIndex={4}>
        Pe
      </DayCheckbox>
      <DayCheckbox
        weekdays={asWeekdaysValue}
        register={register}
        dataTest={`weekdays-saturday-${index}`}
        namePrefix={weekdaysNamePrefix}
        dayIndex={5}>
        La
      </DayCheckbox>
      <DayCheckbox
        weekdays={asWeekdaysValue}
        register={register}
        dataTest={`weekdays-sunday-${index}`}
        namePrefix={weekdaysNamePrefix}
        dayIndex={6}>
        Su
      </DayCheckbox>
    </fieldset>
  );
}
