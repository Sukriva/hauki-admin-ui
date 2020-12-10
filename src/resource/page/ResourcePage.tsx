import React, { ReactNode, useEffect, useState } from 'react';
import { Notification } from 'hds-react';
import api from '../../common/utils/api/api';
import { DatePeriod, Language, Resource } from '../../common/lib/types';
import Collapse from '../../components/collapse/Collapse';
import LanguageSelect, {
  displayLangVersionNotFound,
} from '../../components/language-select/LanguageSelect';
import { ExternalLink } from '../../components/link/Link';
import LoadingIndicator from '../../components/loadingIndicator/LoadingIndicator';
import ResourceOpeningHours from '../resource-opening-hours/ResourceOpeningHours';
import './ResourcePage.scss';

export const ResourceTitle = ({
  resource,
  language = Language.FI,
  children,
}: {
  resource?: Resource;
  language?: Language;
  children: ReactNode;
}): JSX.Element => {
  const name =
    resource?.name[language] ||
    displayLangVersionNotFound({ language, label: 'toimipisteen nimi' });

  return (
    <div className="resource-info-title-wrapper">
      <h1 data-test="resource-info" className="resource-info-title">
        {name}
      </h1>
      <div className="resource-info-title-add-on">{children}</div>
    </div>
  );
};

export const ResourceAddress = ({
  resource,
  language = Language.FI,
}: {
  resource?: Resource;
  language?: Language;
}): JSX.Element => {
  const address =
    resource?.address[language] ||
    displayLangVersionNotFound({ language, label: 'toimipisteen osoite' });

  return (
    <>
      <span>Osoite: </span>
      <address className="resource-info-address">{address}</address>
    </>
  );
};

export const ResourceInfo = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => (
  <section aria-label="Toimipisteen tiedot">{children}</section>
);

const ResourceSection = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}): JSX.Element => (
  <section id={id} className="resource-details-section">
    {children}
  </section>
);

const ResourceDetailsSection = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}): JSX.Element => (
  <ResourceSection id={id}>
    <Collapse isOpen collapseContentId={`${id}-section`} title={title}>
      {children}
    </Collapse>
  </ResourceSection>
);

const ResourceSourceLink = ({
  id,
  resource,
}: {
  id: string;
  resource?: Resource;
}): JSX.Element | null => {
  const adminLink = resource?.extra_data?.admin_url;

  if (!adminLink) {
    return null;
  }

  return (
    <ResourceSection id={id}>
      <p>
        Toimipisteeseen liittyvät tiedot kieliversioineen ovat lähtöisin
        Toimipisterekisteristä. Tietojen muuttaminen on mahdollista
        Toimipisterekisterissä.
        <br />
        <ExternalLink
          href={adminLink}
          text="Tarkastele toimipisteen tietoja Toimipisterekisterissä"
        />
      </p>
    </ResourceSection>
  );
};

export default function ResourcePage({ id }: { id: string }): JSX.Element {
  const [resource, setResource] = useState<Resource | undefined>(undefined);
  const [datePeriods, setDatePeriods] = useState<DatePeriod[]>([]);
  const [hasError, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>(Language.FI);

  useEffect((): void => {
    // UseEffect's callbacks are synchronous to prevent a race condition.
    // We can not use an async function as an useEffect's callback because it would return Promise<void>
    api
      .getResource(id)
      .then((r: Resource) => {
        setResource(r);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e);
        setLoading(false);
      });
  }, [id]);

  useEffect((): void => {
    // UseEffect's callbacks are synchronous to prevent a race condition.
    // We can not use an async function as an useEffect's callback because it would return Promise<void>
    if (resource) {
      setLoading(true);

      api
        .getDatePeriods(resource.id)
        .then((ds: DatePeriod[]) => {
          setDatePeriods(ds);
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
      <>
        <h1 className="resource-info-title">Toimipisteen tietojen haku</h1>
        <LoadingIndicator
          text="Toimipisteen tietoja haetaan."
          readyText="Toimipisteen tiedot haettu"
        />
      </>
    );
  }

  if (hasError) {
    return (
      <>
        <h1 className="resource-info-title">Virhe</h1>
        <Notification label="Toimipistettä ei saatu ladattua." type="error">
          Tarkista toimipiste-id.
        </Notification>
      </>
    );
  }

  return (
    <>
      <ResourceInfo>
        <ResourceTitle resource={resource} language={language}>
          <LanguageSelect
            id="resource-info-language-select"
            label="Toimipisteen tietojen kielivalinta"
            className="resource-info-language-selector"
            selectedLanguage={language}
            onSelect={setLanguage}
            formatter={(selectedLanguage: Language): string =>
              `Esityskieli: ${selectedLanguage.toUpperCase()}`
            }
            theme="dark"
          />
        </ResourceTitle>
        <ResourceAddress resource={resource} language={language} />
      </ResourceInfo>
      <ResourceDetailsSection id="resource-description" title="Perustiedot">
        <p className="resource-description-text">
          {resource?.description[language] || 'Toimipisteellä ei ole kuvausta.'}
        </p>
      </ResourceDetailsSection>
      <ResourceSourceLink id="resource-source-link" resource={resource} />
      <ResourceSection id="resource-opening-hours">
        <ResourceOpeningHours id={id} datePeriods={datePeriods} />
      </ResourceSection>
    </>
  );
}
