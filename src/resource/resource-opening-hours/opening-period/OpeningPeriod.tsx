import React from 'react';
import {
  DatePeriod,
  Language,
  LanguageStrings,
} from '../../../common/lib/types';
import { formatDateRange } from '../../../common/utils/date-time/format';
import './OpeningPeriod.scss';

const notFoundName: LanguageStrings = {
  fi: '-- Suomenkielinen nimi puuttuu --',
  sv: '-- Ruotsinkielinen nimi puuttuu --',
  en: '-- Englanninkielinen nimi puuttuu --',
};

export default function OpeningPeriod({
  datePeriod,
  language = 'fi',
}: {
  datePeriod: DatePeriod;
  language: Language;
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
          <h4>{datePeriod.name?.[language] || notFoundName[language]}</h4>
        </div>
      </div>
    </div>
  );
}
