import React from 'react';
import { FieldErrors } from 'react-hook-form/dist/types/errors.d';
import { TextArea, TextInput } from 'hds-react';
import './OpeningPeriodDescription.scss';
import { TextFieldConfig } from '../../common/lib/types';

type TFieldValues = {
  openingPeriodTitle: string;
};

export default function OpeningPeriodDescription({
  register,
  errors,
  nameFieldConfig,
}: {
  register: Function;
  errors: FieldErrors<TFieldValues>;
  nameFieldConfig: TextFieldConfig;
}): JSX.Element {
  const hasError =
    errors.openingPeriodTitle && errors.openingPeriodTitle.type === 'required';

  const titleMaxLength: number | undefined = nameFieldConfig.max_length;

  return (
    <>
      <h3 className="opening-period-section-title">Jakson kuvaus</h3>
      <div className="form-control">
        <label htmlFor="openingPeriodTitle" className="form-label">
          Aukiolojakson otsikko *
        </label>
        <TextInput
          className="opening-period-title-input"
          type="text"
          name="openingPeriodTitle"
          data-test="openingPeriodTitle"
          id="openingPeriodTitle"
          aria-invalid={errors.openingPeriodTitle ? 'true' : 'false'}
          ref={register({
            required: true,
            maxLength: titleMaxLength,
          })}
          helperText={
            hasError ? 'Aukiolojakson otsikko on pakollinen' : undefined
          }
          invalid={hasError}
          {...(titleMaxLength ? { maxLength: titleMaxLength } : {})}
        />
      </div>
      <div className="form-control">
        <label htmlFor="openingPeriodOptionalDescription">
          Jakson valinnainen kuvaus
        </label>
        <TextArea
          cols={90}
          rows={9}
          className="opening-period-optional-description"
          id="openingPeriodOptionalDescription"
          name="openingPeriodOptionalDescription"
          ref={register({ maxLength: 255 })}
        />
      </div>
    </>
  );
}
