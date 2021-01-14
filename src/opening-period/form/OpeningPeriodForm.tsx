import React, { useState } from 'react';
import { ArrayField, useFieldArray, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import {
  DatePeriod,
  UiDatePeriodConfig,
  Language,
  TimeSpanFormFormat,
  TimeSpanGroup,
  GroupRuleFormFormat,
} from '../../common/lib/types';
import { transformDateToApiFormat } from '../../common/utils/date-time/format';
import Datepicker from '../../components/datepicker/Datepicker';
import { PrimaryButton, SecondaryButton } from '../../components/button/Button';
import { useToast } from '../../components/notification/toastContext';
import {
  formatApiTimeSpansToFormFormat,
  formatTimeSpansToApiFormat,
  formatApiRulesToFormFormat,
  formatRulesToApiFormat,
} from './form-helpers/form-helpers';
import OpeningPeriodDescription from '../description/OpeningPeriodDescription';
import TimeSpan from '../time-span/TimeSpan';
import Rule from '../rule/Rule';
import './OpeningPeriodForm.scss';

interface OpeningPeriodFormData {
  openingPeriodTitle: string;
  openingPeriodOptionalDescription: string;
  openingPeriodBeginDate: string | undefined;
  openingPeriodEndDate: string | undefined;
  timeSpans: Array<TimeSpanFormFormat> | {}[];
  rules: GroupRuleFormFormat[];
}

type NotificationTexts = {
  label: string;
  text: string;
};

export default function OpeningPeriodForm({
  formId,
  datePeriod,
  resourceId,
  datePeriodConfig,
  submitFn,
  successTextAndLabel,
  errorTextAndLabel,
}: {
  formId: string;
  datePeriod?: DatePeriod;
  resourceId: number;
  datePeriodConfig: UiDatePeriodConfig;
  submitFn: (datePeriod: DatePeriod) => Promise<DatePeriod>;
  successTextAndLabel: NotificationTexts;
  errorTextAndLabel: NotificationTexts;
}): JSX.Element {
  const language = Language.FI;
  const { showToast } = useToast();
  const {
    resourceState: resourceStateConfig,
    timeSpanGroup: { rule: ruleConfig },
  } = datePeriodConfig;

  const firstTimeSpanGroup: TimeSpanGroup | undefined =
    datePeriod?.time_span_groups[0];

  const spans: TimeSpanFormFormat[] | {}[] =
    firstTimeSpanGroup && firstTimeSpanGroup.time_spans
      ? formatApiTimeSpansToFormFormat(firstTimeSpanGroup.time_spans)
      : [{}];

  const rules: GroupRuleFormFormat[] | [] = firstTimeSpanGroup?.rules.length
    ? formatApiRulesToFormFormat(firstTimeSpanGroup?.rules)
    : [];

  const [periodBeginDate, setPeriodBeginDate] = useState<Date | null>(
    datePeriod?.start_date ? new Date(datePeriod?.start_date) : null
  );

  const [periodEndDate, setPeriodEndDate] = useState<Date | null>(
    datePeriod?.end_date ? new Date(datePeriod?.end_date) : null
  );

  const formValues: OpeningPeriodFormData = {
    openingPeriodTitle: datePeriod?.name[language] || '',
    openingPeriodOptionalDescription: datePeriod?.description[language] || '',
    openingPeriodBeginDate: datePeriod?.start_date,
    openingPeriodEndDate: datePeriod?.end_date,
    timeSpans: spans,
    rules,
  };

  const { register, handleSubmit, errors, control, setValue } = useForm<
    OpeningPeriodFormData
  >({
    mode: 'all',
    defaultValues: formValues,
  });

  const {
    fields: timeSpanFields,
    append: appendTimeSpan,
    remove: removeTimeSpan,
  } = useFieldArray({
    control,
    keyName: 'timeSpanUiId',
    name: 'timeSpans',
  });

  const {
    fields: ruleFields,
    append: appendRule,
    remove: removeRule,
  } = useFieldArray({
    control,
    keyName: 'rulesUiId',
    name: 'rules',
  });

  const history = useHistory();

  const onSubmit = async (data: OpeningPeriodFormData): Promise<void> => {
    const validTimeSpans: TimeSpanFormFormat[] = data.timeSpans
      ? (data.timeSpans.filter(
          (span: TimeSpanFormFormat | {}) => Object.keys(span).length > 0
        ) as TimeSpanFormFormat[])
      : [];

    const validRules: GroupRuleFormFormat[] = data.rules
      ? (data.rules.filter((rule: GroupRuleFormFormat | {}): boolean => {
          const validValues = Object.values(rule)
            .filter((value) => value !== '')
            .filter((val) => val);
          return validValues.length > 0;
        }) as GroupRuleFormFormat[])
      : [];

    try {
      const dataAsDatePeriod: DatePeriod = {
        ...(datePeriod?.id ? { id: datePeriod.id } : {}),
        resource: resourceId,
        name: {
          fi: data.openingPeriodTitle,
          sv: null,
          en: null,
        },
        description: {
          fi: data.openingPeriodOptionalDescription,
          sv: null,
          en: null,
        },
        start_date: data.openingPeriodBeginDate
          ? transformDateToApiFormat(data.openingPeriodBeginDate)
          : undefined,
        end_date: data.openingPeriodEndDate
          ? transformDateToApiFormat(data.openingPeriodEndDate)
          : undefined,
        override: datePeriod?.override || false,
        time_span_groups: [
          {
            id: firstTimeSpanGroup?.id,
            period: firstTimeSpanGroup?.period,
            time_spans: formatTimeSpansToApiFormat(validTimeSpans || []),
            rules: formatRulesToApiFormat(validRules),
          },
        ],
      };
      const updatedPeriod = await submitFn(dataAsDatePeriod);
      if (updatedPeriod) {
        showToast({
          key: `period-form-success-${datePeriod?.id}`,
          type: 'success',
          dataTestId: 'opening-period-form-success',
          label: successTextAndLabel.label,
          text: successTextAndLabel.text,
        });
        history.push(`/resource/${resourceId}`);
      }
    } catch (err) {
      showToast({
        key: `period-form-error-${datePeriod?.id}`,
        type: 'error',
        dataTestId: 'opening-period-form-error',
        label: errorTextAndLabel.label,
        text: errorTextAndLabel.text,
      });
      // eslint-disable-next-line no-console
      console.error(err); // For debug purposes
    }
  };

  return (
    <form
      id={formId}
      data-test={formId}
      className="opening-period-form"
      onSubmit={handleSubmit(onSubmit)}>
      <section className="form-section">
        <OpeningPeriodDescription register={register} errors={errors} />
      </section>
      <section className="form-section">
        <h3 className="opening-period-section-title">Ajanjakso</h3>
        <div className="form-control">
          <section className="opening-period-time-period">
            <Datepicker
              id="openingPeriodBeginDate"
              dataTest="openingPeriodBeginDate"
              labelText="Alkaa"
              onChange={(value): void => setPeriodBeginDate(value || null)}
              value={periodBeginDate}
              registerFn={register}
            />
            <p className="dash-between-begin-and-end-date">—</p>
            <Datepicker
              id="openingPeriodEndDate"
              dataTest="openingPeriodEndDate"
              labelText="Päättyy"
              onChange={(value): void => setPeriodEndDate(value || null)}
              value={periodEndDate}
              registerFn={register}
            />
          </section>
        </div>
      </section>
      <section className="form-section time-span-group">
        <h3 className="opening-period-section-title">Aukioloajat</h3>
        <ul
          className="opening-period-field-list form-group"
          data-test="time-span-list">
          {timeSpanFields.map(
            (
              item: Partial<ArrayField<Record<string, TimeSpanFormFormat>>>,
              index
            ) => (
              <li
                className="opening-period-field-list-item"
                key={`time-span-${item.id || index}`}>
                <TimeSpan
                  item={item}
                  resourceStateConfig={resourceStateConfig}
                  control={control}
                  register={register}
                  index={index}
                  remove={removeTimeSpan}
                />
              </li>
            )
          )}
        </ul>
        <div className="form-group">
          <SecondaryButton
            dataTest="add-new-time-span-button"
            onClick={(): void => appendTimeSpan({})}>
            + Lisää aukioloaika
          </SecondaryButton>
        </div>
        <div className="form-group">
          <h3 className="opening-period-section-title">
            Aukioloaikojen voimassaolo
          </h3>
          <ul
            className="opening-period-field-list opening-period-rule-list form-group"
            data-test="rule-list">
            {ruleFields.map(
              (
                rule: Partial<ArrayField<Record<string, GroupRuleFormFormat>>>,
                index
              ) => (
                <li
                  className="opening-period-field-list-item opening-period-rule-list-item"
                  key={`rule-${rule.id || index}`}
                  data-test={`rule-list-item-${rule.id || index}`}>
                  <Rule
                    rule={rule}
                    index={index}
                    control={control}
                    setValue={setValue}
                    remove={removeRule}
                    register={register}
                    ruleConfig={ruleConfig}
                  />
                </li>
              )
            )}
          </ul>
          <div className="form-group">
            <SecondaryButton
              dataTest="add-new-rule-button"
              onClick={(): void => appendRule({})}>
              + Lisää aukioloaikojen voimassaolosääntö
            </SecondaryButton>
          </div>
        </div>
      </section>
      <div className="opening-period-final-action-row-container">
        <PrimaryButton
          dataTest="publish-opening-period-button"
          className="opening-period-final-action-button"
          type="submit">
          Julkaise
        </PrimaryButton>
        <SecondaryButton
          className="opening-period-final-action-button"
          onClick={(): void => history.push(`/resource/${resourceId}`)}>
          Peruuta ja palaa
        </SecondaryButton>
      </div>
    </form>
  );
}
