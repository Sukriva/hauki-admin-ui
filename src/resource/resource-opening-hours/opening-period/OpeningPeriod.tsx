import React from 'react';
import {
  DatePeriod,
  ResourceState,
  TimeSpan,
  TimeSpanGroup,
} from '../../../common/lib/types';
import {
  formatDateRange,
  formatTime,
} from '../../../common/utils/date-time/format';
import weekdaySpansToText from '../../../common/utils/opening-period/helpers';
import './OpeningPeriod.scss';

export default function OpeningPeriod({
  datePeriod,
}: {
  datePeriod: DatePeriod;
}): JSX.Element {
  return (
    <div className="opening-period-card">
      <div className="opening-period-card-row">
        <div className="opening-period-card-times">
          <div>
            {formatDateRange({
              startDate: datePeriod.start_date,
              endDate: datePeriod.end_date,
            })}
          </div>
        </div>
        <div className="opening-period-card-text">
          <h4>{datePeriod.name?.fi}</h4>
        </div>
      </div>

      {datePeriod.time_span_groups.length === 0 &&
      datePeriod.resource_state === ResourceState.CLOSED ? (
        <div className="opening-period-card-row">
          <div className="opening-period-card-times" />
          <div className="opening-period-card-text">
            <div>{datePeriod.resource_state}</div>
          </div>
        </div>
      ) : null}

      {datePeriod.time_span_groups.map((ts: TimeSpanGroup) =>
        ts.time_spans.map((timeSpan: TimeSpan) => (
          <div className="opening-period-card-row">
            <div className="opening-period-card-times">
              <div className="opening-period-time-span-days">
                {weekdaySpansToText(timeSpan.weekdays, 'fi')}
              </div>
              <div className="opening-period-time-span-hours">
                {`${formatTime(timeSpan.start_time)} - ${formatTime(
                  timeSpan.end_time
                )}`}
              </div>
            </div>
            <div className="opening-period-card-text">
              <div>{timeSpan.resource_state}</div>
              <div>{timeSpan.name?.fi}</div>
              <div>{timeSpan.description?.fi}</div>
            </div>
          </div>
        ))
      )}
      <div className="opening-period-card-row">
        <p>{datePeriod.description?.fi}</p>
      </div>
    </div>
  );
}
