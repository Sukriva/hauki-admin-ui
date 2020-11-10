import React, { ReactNode, useEffect, useState } from 'react';
import { Notification } from 'hds-react';
import api from '../../common/utils/api/api';
import { Resource, DatePeriod } from '../../common/lib/types';
import Collapse from '../../components/collapse/Collapse';
import { ExternalLink } from '../../components/link/Link';
import ResourceOpeningHours from '../resource-opening-hours/ResourceOpeningHours';
import './ResourcePage.scss';

const hasText = (str: string | null | undefined): boolean =>
  str !== undefined && str !== null && str !== '';

const ResourceInfo = ({ resource }: { resource?: Resource }): JSX.Element => (
  <>
    <h1 data-test="resource-info" className="resource-info-title">
      {resource?.name?.fi}
    </h1>
    {hasText(resource?.address?.fi) && (
      <div>
        <span>Osoite: </span>
        <address className="resource-info-address">
          {hasText(resource?.address?.fi)
            ? resource?.address?.fi
            : 'Toimipisteellä ei ole osoitetta.'}
        </address>
      </div>
    )}
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
  const [datePeriods, setDatePeriods] = useState<DatePeriod[]>([]);
  const [hasError, setError] = useState<Error | undefined>(undefined);
  const [isLoading, setLoading] = useState<boolean>(true);

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
      api
        .getDatePeriod(resource.id)
        .then((ds: DatePeriod[]) => {
          setDatePeriods(ds);
        })
        .catch((e: Error) => {
          setError(e);
        });
    }
  }, [resource]);

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
      <ResourceInfo resource={resource} />
      <ResourceDetailsSection id="resource-description" title="Perustiedot">
        <p className="resource-description-text">
          {hasText(resource?.description?.fi)
            ? resource?.description?.fi
            : 'Toimipisteellä ei ole kuvausta.'}
        </p>
      </ResourceDetailsSection>
      <ResourceSourceLink id="resource-source-link" resource={resource} />
      <ResourceSection id="resource-opening-hours">
        <ResourceOpeningHours id={id} datePeriods={datePeriods} />
      </ResourceSection>
    </>
  );
}
