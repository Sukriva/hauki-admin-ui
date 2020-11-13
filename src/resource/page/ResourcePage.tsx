import React, { ReactNode, useEffect, useState } from 'react';
import { Notification } from 'hds-react';
import api, { Resource } from '../../common/utils/api/api';
import Collapse from '../../components/collapse/Collapse';
import { ExternalLink } from '../../components/link/Link';
import ResourceOpeningHours from '../resource-opening-hours/ResourceOpeningHours';
import './ResourcePage.scss';
import LanguageSelect, {
  languageOptions,
} from '../../components/language-selector/LanguageSelector';
import { Language, LanguageOption } from '../../common/lib/types';

const hasText = (str: string | null | undefined): boolean =>
  str !== undefined && str !== null && str !== '';

const ResourceInfo = ({
  resource,
  language,
  setLanguage,
}: {
  resource?: Resource;
  language: LanguageOption;
  setLanguage: (language: LanguageOption) => void;
}): JSX.Element => (
  <>
    <h1 data-test="resource-info" className="resource-info-title">
      {resource?.name?.fi}
    </h1>
    <LanguageSelect language={language} setLanguage={setLanguage} />
    <div>
      <span>Osoite: </span>
      <address className="resource-info-address">
        {resource?.address?.[language.value] ||
          'Toimipisteellä ei ole osoitetta.'}
      </address>
    </div>
  </>
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
  const [hasError, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState(languageOptions[0]);

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

  if (isLoading) {
    return (
      <>
        <h1 className="resource-info-title">Toimipisteen tietojen haku</h1>
        <p>Toimipisteen tietoja ladataan...</p>
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
      <ResourceInfo
        resource={resource}
        language={language}
        setLanguage={setLanguage}
      />
      <ResourceDetailsSection id="resource-description" title="Perustiedot">
        <p className="resource-description-text">
          {hasText(resource?.description?.fi)
            ? resource?.description?.fi
            : 'Toimipisteellä ei ole kuvausta.'}
        </p>
      </ResourceDetailsSection>
      <ResourceSourceLink id="resource-source-link" resource={resource} />
      {resource && (
        <ResourceSection id="resource-opening-hours">
          <ResourceOpeningHours id={id} resource={resource} />
        </ResourceSection>
      )}
    </>
  );
}
