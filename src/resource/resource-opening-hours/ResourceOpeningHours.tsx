import React, { useEffect, useState } from 'react';
import { IconInfoCircle, Button, Notification } from 'hds-react';
import api, { Resource } from '../../common/utils/api/api';
import { DatePeriod, Language } from '../../common/lib/types';
import OpeningPeriod from './opening-period/OpeningPeriod';
import Collapse from '../../components/collapse/Collapse';
import './ResourceOpeningHours.scss';
import LanguageSelect, {
  languageOptions,
} from '../../components/language-selector/LanguageSelector';

enum PeriodListTheme {
  DEFAULT = 'DEFAULT',
  LIGHT = 'LIGHT',
}

const OpeningPeriodsList = ({
  title,
  periods,
  theme,
  notFoundText,
}: {
  title: string;
  theme: PeriodListTheme;
  periods: DatePeriod[];
  notFoundText: string;
}): JSX.Element => {
  const openingPeriodsHeaderClassName =
    theme === PeriodListTheme.LIGHT
      ? 'opening-periods-header-light'
      : 'opening-periods-header';

  const [language, setLanguage] = useState(languageOptions[0]);

  return (
    <section className="opening-periods-section">
      <header className={openingPeriodsHeaderClassName}>
        <div className="opening-periods-header-container">
          <h3 className="opening-periods-header-title">{title}</h3>
          <IconInfoCircle
            aria-label="Lisätietoja aukiolojaksoista nappi"
            className="opening-periods-header-info"
          />
        </div>
        <div className="opening-periods-header-container">
          <p className="period-count">{periods.length} jaksoa</p>
          <LanguageSelect language={language} setLanguage={setLanguage} />
          <Button
            size="small"
            className="opening-period-header-button"
            variant="secondary">
            Lisää uusi +
          </Button>
        </div>
      </header>
      <ul
        className="opening-periods-list"
        data-test="resource-opening-periods-list">
        {periods.length > 0 ? (
          periods.map((datePeriod: DatePeriod) => (
            <li>
              <OpeningPeriod
                datePeriod={datePeriod}
                language={language.value as Language}
              />
            </li>
          ))
        ) : (
          <li>
            <OpeningPeriodsNotFound text={notFoundText} />
          </li>
        )}
      </ul>
    </section>
  );
};

const OpeningPeriodsNotFound = ({ text }: { text: string }): JSX.Element => (
  <p className="opening-periods-not-found">{text}</p>
);

const ResourcePeriodsSection = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}): JSX.Element => (
  <Collapse
    isOpen
    collapseContentId={`${id}-opening-hours-section`}
    title="Toimipisteen aukiolotiedot">
    <p>
      Toimipisteen aukiolotietoja muokataan jaksokohtaisesti. Aukiolojaksot
      voivat olla julkaistuja tai julkaisemattomia. Alla voit selata myös
      tulevia ja menneitä aukiolojaksoja. Näet alla myös eri kieliversiot
      valitsemalla kielen valikosta. Huomioithan, että palvelu voi itse valita
      aukiolojaksojen esitystavan, se ei välttämättä ole alla näkyvän kaltainen.
    </p>
    {children}
  </Collapse>
);

export default function ResourceOpeningHours({
  id,
  resource,
}: {
  id: string;
  resource: Resource;
}): JSX.Element {
  const [defaultPeriods, setDefaultPeriods] = useState<DatePeriod[]>([]);
  const [exceptionPeriods, setExeptionPeriods] = useState<DatePeriod[]>([]);
  const [hasError, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect((): void => {
    // UseEffect's callbacks are synchronous to prevent a race condition.
    // We can not use an async function as an useEffect's callback because it would return Promise<void>
    if (resource) {
      api
        .getDatePeriod(resource.id)
        .then((datePeriods: DatePeriod[]) => {
          setDefaultPeriods(
            datePeriods.filter((period: DatePeriod) => !period.override)
          );
          setExeptionPeriods(
            datePeriods.filter((period: DatePeriod) => period.override)
          );
          setLoading(false);
        })
        .catch((e: Error) => {
          setError(e);
          setLoading(false);
        });
    }
  }, [resource]);

  if (isLoading) {
    return (
      <ResourcePeriodsSection id={id}>
        <p>Toimipisteen aukiolojaksoja ladataan...</p>
      </ResourcePeriodsSection>
    );
  }

  if (hasError) {
    return (
      <ResourcePeriodsSection id={id}>
        <p>
          <Notification
            label="Aukiolojaksoja ei saatu ladattua."
            type="error"
          />
        </p>
      </ResourcePeriodsSection>
    );
  }

  return (
    <ResourcePeriodsSection id={id}>
      <OpeningPeriodsList
        title="Aukiolojaksot"
        theme={PeriodListTheme.DEFAULT}
        periods={defaultPeriods}
        notFoundText="Ei aukiolojaksoja."
      />
      <OpeningPeriodsList
        title="Poikkeusaukiolojaksot"
        theme={PeriodListTheme.LIGHT}
        periods={exceptionPeriods}
        notFoundText="Ei poikkeusaukiolojaksoja."
      />
    </ResourcePeriodsSection>
  );
}
