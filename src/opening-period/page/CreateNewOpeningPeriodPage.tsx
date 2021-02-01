import React, { useEffect, useState } from 'react';
import { Notification } from 'hds-react';
import {
  Resource,
  DatePeriod,
  UiDatePeriodConfig,
} from '../../common/lib/types';
import api from '../../common/utils/api/api';
import {
  ResourceAddress,
  ResourceInfo,
  ResourceInfoSubTitle,
  ResourceTitle,
} from '../../resource/page/ResourcePage';
import OpeningPeriodForm from '../form/OpeningPeriodForm';

export default function CreateNewOpeningPeriodPage({
  resourceId,
}: {
  resourceId: string;
}): JSX.Element {
  const [resource, setResource] = useState<Resource>();
  const [datePeriodConfig, setDatePeriodConfig] = useState<
    UiDatePeriodConfig
  >();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasDataLoadingError, setHasDataLoadingError] = useState<boolean>(
    false
  );

  const submitFn = async (data: DatePeriod): Promise<DatePeriod> =>
    api.postDatePeriod(data);

  useEffect((): void => {
    const fetchData = async (): Promise<void> => {
      try {
        const [apiResource, uiDatePeriodOptions] = await Promise.all([
          api.getResource(resourceId),
          api.getDatePeriodFormConfig(),
        ]);
        setResource(apiResource);
        setDatePeriodConfig(uiDatePeriodOptions);
        setIsLoading(false);
      } catch (e) {
        setHasDataLoadingError(true);
        setIsLoading(false);
        // eslint-disable-next-line no-console
        console.error('Add date-period - data initialization error:', e);
      }
    };

    fetchData();
  }, [resourceId]);

  if (hasDataLoadingError) {
    return (
      <>
        <h1 className="resource-info-title">Virhe</h1>
        <Notification
          dataTestId="error-retrieving-resource-info"
          label="Toimipisteen tai lomakkeen tietoja ei saatu ladattua."
          type="error">
          Tarkista toimipiste-id ja että sinulla on riittävät oikeudet sen
          aukiolojen muokkaamiseen.
        </Notification>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <h1 className="resource-info-title">Aukiolojakson lisäys</h1>
        <p>Sivua ladataan...</p>
      </>
    );
  }

  return (
    <>
      <ResourceInfo>
        <ResourceTitle resource={resource}>
          <ResourceInfoSubTitle text="Toimipisteen aukiolojakson lisäys" />
        </ResourceTitle>
        <ResourceAddress resource={resource} />
      </ResourceInfo>
      {resource && datePeriodConfig && (
        <OpeningPeriodForm
          formId="add-new-opening-period-form"
          resourceId={resource.id}
          datePeriodConfig={datePeriodConfig}
          submitFn={submitFn}
          successTextAndLabel={{
            label: 'Aukiolojakso tallennettu onnistuneesti.',
            text: 'Aukiolojakso tallennettu onnistuneesti.',
          }}
          errorTextAndLabel={{
            label: 'Aukiolojakson tallennus epäonnistui',
            text:
              'Aukiolojakson tallennus epäonnistui. Yritä myöhemmin uudestaan.',
          }}
        />
      )}
    </>
  );
}
