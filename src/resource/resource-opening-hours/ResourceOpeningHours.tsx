import React, { useEffect, useState } from 'react';
import { IconInfoCircle, Button, Notification } from 'hds-react';
import { useHistory } from 'react-router-dom';
import {
  DatePeriod,
  Language,
  UiDatePeriodConfig,
} from '../../common/lib/types';
import api from '../../common/utils/api/api';
import Collapse from '../../components/collapse/Collapse';
import LanguageSelect from '../../components/language-select/LanguageSelect';
import OpeningPeriod from './opening-period/OpeningPeriod';
import './ResourceOpeningHours.scss';

enum PeriodsListTheme {
  DEFAULT = 'DEFAULT',
  LIGHT = 'LIGHT',
}

const OpeningPeriodsList = ({
  id,
  addNewOpeningPeriodButtonDataTest,
  resourceId,
  title,
  datePeriods,
  datePeriodConfig,
  theme,
  notFoundLabel,
  deletePeriod,
}: {
  id: string;
  addNewOpeningPeriodButtonDataTest?: string;
  resourceId: number;
  title: string;
  datePeriods: DatePeriod[];
  datePeriodConfig?: UiDatePeriodConfig;
  theme: PeriodsListTheme;
  notFoundLabel: string;
  deletePeriod: (id: number) => Promise<void>;
}): JSX.Element => {
  const openingPeriodsHeaderClassName =
    theme === PeriodsListTheme.LIGHT
      ? 'opening-periods-header-light'
      : 'opening-periods-header';

  const history = useHistory();
  const [language, setLanguage] = useState(Language.FI);

  return (
    <section className="opening-periods-section">
      <header className={openingPeriodsHeaderClassName}>
        <div className="opening-periods-header-container">
          <h3 className="opening-periods-header-title">{title}</h3>
          <IconInfoCircle
            aria-hidden
            aria-label="Lisätietoja aukiolojaksoista nappi"
            className="opening-periods-header-info"
          />
        </div>
        <div className="opening-periods-header-container opening-periods-header-actions">
          <p className="period-count">{datePeriods.length} jaksoa</p>
          <LanguageSelect
            id={`${id}-language-select`}
            label={`${title}-listan kielivalinta`}
            selectedLanguage={language}
            onSelect={setLanguage}
          />
          <Button
            data-test={addNewOpeningPeriodButtonDataTest}
            size="small"
            className="opening-period-header-button"
            onClick={(): void =>
              history.push(`/resource/${resourceId}/period/new`)
            }
            variant="secondary">
            Lisää uusi +
          </Button>
        </div>
      </header>
      {datePeriodConfig && (
        <ul className="opening-periods-list" data-test={id}>
          {datePeriods.length > 0 ? (
            datePeriods.map((datePeriod: DatePeriod, index) => (
              <li key={datePeriod.id}>
                <OpeningPeriod
                  datePeriodConfig={datePeriodConfig}
                  datePeriod={datePeriod}
                  resourceId={resourceId}
                  language={language}
                  deletePeriod={deletePeriod}
                  initiallyOpen={index === 0}
                />
              </li>
            ))
          ) : (
            <li>
              <OpeningPeriodsNotFound text={notFoundLabel} />
            </li>
          )}
        </ul>
      )}
    </section>
  );
};

const OpeningPeriodsNotFound = ({ text }: { text: string }): JSX.Element => (
  <p className="opening-periods-not-found">{text}</p>
);

const partitionByOverride = (datePeriods: DatePeriod[]): DatePeriod[][] =>
  datePeriods.reduce(
    ([defaults = [], exceptions = []]: DatePeriod[][], current: DatePeriod) => {
      return current.override
        ? [defaults, [...exceptions, current]]
        : [[...defaults, current], exceptions];
    },
    [[], []]
  );

export default function ResourceOpeningHours({
  resourceId,
}: {
  resourceId: number;
}): JSX.Element | null {
  const [error, setError] = useState<Error | undefined>(undefined);
  const [datePeriodConfig, setDatePeriodConfig] = useState<
    UiDatePeriodConfig
  >();
  const [[defaultPeriods, exceptionPeriods], setDividedDatePeriods] = useState<
    DatePeriod[][]
  >([[], []]);
  const fetchDatePeriods = async (id: number): Promise<void> => {
    try {
      const [apiDatePeriods, uiDatePeriodOptions] = await Promise.all([
        api.getDatePeriods(id),
        api.getDatePeriodFormConfig(),
      ]);
      const datePeriodLists = partitionByOverride(apiDatePeriods);
      setDividedDatePeriods(datePeriodLists);
      setDatePeriodConfig(uiDatePeriodOptions);
    } catch (e) {
      setError(e);
    }
  };

  useEffect(() => {
    fetchDatePeriods(resourceId);
  }, [resourceId]);

  const deletePeriod = async (datePeriodId: number): Promise<void> => {
    await api.deleteDatePeriod(datePeriodId);
    fetchDatePeriods(resourceId);
  };

  if (error) {
    return (
      <>
        <h1 className="resource-info-title">Virhe</h1>
        <Notification
          label="Toimipisteen aukiolojaksoja ei saatu ladattua."
          type="error">
          Tarkista toimipiste-id.
        </Notification>
      </>
    );
  }

  return (
    <Collapse
      isOpen
      collapseContentId={`${resourceId}-opening-hours-section`}
      title="Toimipisteen aukiolotiedot">
      <p>
        Toimipisteen aukiolotietoja muokataan jaksokohtaisesti. Aukiolojaksot
        voivat olla julkaistuja tai julkaisemattomia. Alla voit selata myös
        tulevia ja menneitä aukiolojaksoja. Näet alla myös eri kieliversiot
        valitsemalla kielen valikosta. Huomioithan, että palvelu voi itse valita
        aukiolojaksojen esitystavan, se ei välttämättä ole alla näkyvän
        kaltainen.
      </p>
      <OpeningPeriodsList
        id="resource-opening-periods-list"
        addNewOpeningPeriodButtonDataTest="add-new-opening-period-button"
        resourceId={resourceId}
        title="Aukiolojaksot"
        datePeriods={defaultPeriods}
        datePeriodConfig={datePeriodConfig}
        theme={PeriodsListTheme.DEFAULT}
        notFoundLabel="Ei aukiolojaksoja."
        deletePeriod={deletePeriod}
      />
      <OpeningPeriodsList
        id="resource-exception-opening-periods-list"
        resourceId={resourceId}
        title="Poikkeusaukiolojaksot"
        datePeriods={exceptionPeriods}
        datePeriodConfig={datePeriodConfig}
        theme={PeriodsListTheme.LIGHT}
        notFoundLabel="Ei poikkeusaukiolojaksoja."
        deletePeriod={deletePeriod}
      />
    </Collapse>
  );
}
