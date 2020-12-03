import React from 'react';
import api from '../../../common/utils/api/api';
import { DatePeriod } from '../../../common/lib/types';
import { formatDateRange } from '../../../common/utils/date-time/format';
import './OpeningPeriod.scss';

export default function OpeningPeriod({
  datePeriod,
}: {
  datePeriod: DatePeriod;
}): JSX.Element {
  return (
    <div className="opening-period">
      <div className="opening-period-row">
        <div className="opening-period-dates">
          <div>
            {formatDateRange({
              startDate: datePeriod.start_date,
              endDate: datePeriod.end_date,
            })}
          </div>
        </div>
        <div className="opening-period-title">
          <h4>{datePeriod.name?.fi}</h4>
          <button
            type="button"
            onClick={() => api.deleteDatePeriod(datePeriod.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
