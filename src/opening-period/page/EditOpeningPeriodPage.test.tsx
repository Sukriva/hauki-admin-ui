import React from 'react';
import { act } from 'react-dom/test-utils';
import { fireEvent, render, screen } from '@testing-library/react';
import { getElementOrThrow } from '../../../test/test-utils';
import {
  DatePeriod,
  UiDatePeriodConfig,
  Resource,
  ResourceState,
} from '../../common/lib/types';
import api from '../../common/utils/api/api';
import EditOpeningPeriodPage from './EditOpeningPeriodPage';

const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => ({
  useHistory: (): { push: jest.Mock } => ({
    push: mockHistoryPush,
  }),
}));

const closedResourceState = {
  value: 'closed',
  label: 'Suljettu',
};

const testDatePeriodOptions: UiDatePeriodConfig = {
  name: {
    max_length: 255,
  },
  resourceState: {
    options: [
      {
        value: 'open',
        label: 'Auki',
      },
      { ...closedResourceState },
      {
        value: 'self_service',
        label: 'Itsepalvelu',
      },
    ],
  },
  timeSpanGroup: {
    rule: {
      context: {
        options: [
          {
            value: 'period',
            label: 'Jakso',
          },
          {
            value: 'month',
            label: 'Kuukausi',
          },
        ],
      },
      subject: {
        options: [
          {
            value: 'week',
            label: 'Viikko',
          },
          {
            value: 'month',
            label: 'Kuukausi',
          },
          {
            value: 'mon',
            label: 'Maanantai',
          },
        ],
      },
      frequencyModifier: {
        options: [
          {
            value: 'odd',
            label: 'Pariton',
          },
          {
            value: 'even',
            label: 'Parillinen',
          },
        ],
      },
    },
  },
};

const testResource: Resource = {
  id: 1186,
  name: {
    fi: 'Test resource name in finnish',
    sv: 'Test resource name in swedish',
    en: 'Test resource name in english',
  },
  address: {
    fi: 'Test address in finnish',
    sv: 'Test address in swedish',
    en: 'Test address in english',
  },
  description: {
    fi: 'Test description in finnish',
    sv: 'Test description in swedish',
    en: 'Test description in english',
  },
  extra_data: {
    citizen_url: 'kansalaisen puolen url',
    admin_url: 'admin puolen url',
  },
  children: [],
  parents: [],
};

const testResourcePageUrl = `/resource/${testResource.id}`;

const weekdayTimeSpanId = 2636;
const weekendTimeSpanId = 2637;
const periodRuleId = 10;
const monthRuleId = 20;

const testDatePeriod: DatePeriod = {
  id: 1,
  name: { fi: 'test opening period', sv: '', en: '' },
  description: { fi: 'test opening period description', sv: '', en: '' },
  start_date: '2020-12-18',
  end_date: '2021-01-18',
  resource_state: ResourceState.OPEN,
  override: false,
  resource: 1,
  time_span_groups: [
    {
      id: 1225,
      period: 1,
      rules: [
        {
          id: periodRuleId,
          group: 1225,
          context: 'period',
          frequency_modifier: 'even',
          frequency_ordinal: 3,
          subject: 'mon',
          start: 1,
        },
        {
          id: monthRuleId,
          group: 1225,
          context: 'month',
          frequency_modifier: null,
          frequency_ordinal: 1,
          subject: 'week',
          start: 2,
        },
      ],
      time_spans: [
        {
          description: {
            fi: 'Viikonloppuna ovet menevät kiinni tuntia aiemmin',
            sv: null,
            en: null,
          },
          end_time: '17:00:00',
          id: weekendTimeSpanId,
          group: 1225,
          resource_state: ResourceState.SELF_SERVICE,
          start_time: '12:00:00',
          weekdays: [6, 7],
        },
        {
          description: {
            fi: 'Arkena ovet menevät kiinni puolta tuntia aiemmin',
            sv: null,
            en: null,
          },
          end_time: '18:00:00',
          id: weekdayTimeSpanId,
          group: 1225,
          resource_state: ResourceState.OPEN,
          start_time: '10:00:00',
          weekdays: [1, 2, 3, 4, 5],
        },
      ],
    },
  ],
};

const renderEditOpeningPeriodPage = (): Element => {
  const { container } = render(
    <EditOpeningPeriodPage resourceId="tprek:8100" datePeriodId="1" />
  );

  if (!container) {
    throw new Error(
      'Something went wrong in rendering of EditOpeningPeriodPage'
    );
  }
  return container;
};

const clickFormSave = (container: Element): void => {
  const saveButtonSelector = '[data-test="publish-opening-period-button"]';
  const saveButton = container.querySelector(saveButtonSelector);
  if (!saveButton) {
    throw new Error(`Element with selector ${saveButton} not found`);
  }

  fireEvent.click(saveButton);
};

const selectOption = async ({
  container,
  id,
  value,
}: {
  container: Element;
  id: string;
  value: string;
}): Promise<void> => {
  await act(async () => {
    const selectButtonSelector = `${id}-toggle-button`;
    const selectButton = getElementOrThrow(container, selectButtonSelector);

    fireEvent.click(selectButton);
  });

  await act(async () => {
    const selectDropDownSelector = `${id}-menu`;
    const selectMenu = getElementOrThrow(container, selectDropDownSelector);

    const [optionToSelect] = Array.from(
      selectMenu?.querySelectorAll('li') ?? []
    ).filter(
      (el) =>
        el.textContent && el.textContent?.toLowerCase() === value.toLowerCase()
    );

    if (!optionToSelect) {
      throw new Error(`${value} option not found`);
    }

    fireEvent.click(optionToSelect);
  });
};

describe(`<EditNewOpeningPeriodPage />`, () => {
  beforeEach(() => {
    jest
      .spyOn(api, 'getResource')
      .mockImplementation(() => Promise.resolve(testResource));

    jest
      .spyOn(api, 'getDatePeriodFormConfig')
      .mockImplementation(() => Promise.resolve(testDatePeriodOptions));

    jest
      .spyOn(api, 'getDatePeriod')
      .mockImplementation(() => Promise.resolve(testDatePeriod));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render basic date-period data', async () => {
    let container: Element;

    await act(async () => {
      container = renderEditOpeningPeriodPage();
    });

    await act(async () => {
      // Check info data
      expect(
        container.querySelector('[data-test="openingPeriodTitle"]')
      ).toHaveValue(testDatePeriod.name.fi);

      expect(
        container.querySelector('#openingPeriodOptionalDescription')
      ).toHaveValue(testDatePeriod.description.fi);

      expect(container.querySelector('#openingPeriodBeginDate')).toHaveValue(
        '18.12.2020'
      );
      expect(container.querySelector('#openingPeriodEndDate')).toHaveValue(
        '18.01.2021'
      );
    });
  });

  it('should render first the time-span which has the weekdays in the beginning of the week', async () => {
    let container: Element;

    await act(async () => {
      container = renderEditOpeningPeriodPage();
    });

    await act(async () => {
      const firstTimeSpan = getElementOrThrow(
        container,
        '[data-test="time-span-list-0"] > li:first-child'
      );

      expect(
        firstTimeSpan.querySelector(
          '[type="checkbox"][data-test^="weekdays-monday"]'
        )
      ).toBeChecked();

      expect(
        firstTimeSpan.querySelector(
          '[type="checkbox"][data-test^="weekdays-tuesday"]'
        )
      ).toBeChecked();

      expect(
        firstTimeSpan.querySelector(
          '[type="checkbox"][data-test^="weekdays-wednesday"]'
        )
      ).toBeChecked();

      expect(
        firstTimeSpan.querySelector(
          '[type="checkbox"][data-test^="weekdays-thursday"]'
        )
      ).toBeChecked();

      expect(
        firstTimeSpan.querySelector(
          '[type="checkbox"][data-test^="weekdays-friday"]'
        )
      ).toBeChecked();

      expect(
        firstTimeSpan.querySelector(
          '[type="checkbox"][data-test^="weekdays-saturday"]'
        )
      ).not.toBeChecked();

      expect(
        firstTimeSpan.querySelector(
          '[type="checkbox"][data-test^="weekdays-sunday"]'
        )
      ).not.toBeChecked();

      expect(
        firstTimeSpan.querySelector('#time-span-state-id-0-0-toggle-button')
      ).toHaveTextContent('Auki');

      expect(
        firstTimeSpan.querySelector('#time-span-description-0-0')
      ).toHaveValue('Arkena ovet menevät kiinni puolta tuntia aiemmin');
    });
  });

  it('should render last the time-span when it has the weekdays in the end of the week', async () => {
    let container: Element;

    await act(async () => {
      container = renderEditOpeningPeriodPage();
    });

    await act(async () => {
      const lastTimeSpan = getElementOrThrow(
        container,
        '[data-test="time-span-list-0"] > li:last-child'
      );

      expect(
        lastTimeSpan.querySelector(
          '[type="checkbox"][data-test^="weekdays-monday"]'
        )
      ).not.toBeChecked();

      expect(
        lastTimeSpan.querySelector(
          '[type="checkbox"][data-test^="weekdays-tuesday"]'
        )
      ).not.toBeChecked();

      expect(
        lastTimeSpan.querySelector(
          '[type="checkbox"][data-test^="weekdays-wednesday"]'
        )
      ).not.toBeChecked();

      expect(
        lastTimeSpan.querySelector(
          '[type="checkbox"][data-test^="weekdays-thursday"]'
        )
      ).not.toBeChecked();

      expect(
        lastTimeSpan.querySelector(
          '[type="checkbox"][data-test^="weekdays-friday"]'
        )
      ).not.toBeChecked();

      expect(
        lastTimeSpan.querySelector(
          '[type="checkbox"][data-test^="weekdays-saturday"]'
        )
      ).toBeChecked();

      expect(
        lastTimeSpan.querySelector(
          '[type="checkbox"][data-test^="weekdays-sunday"]'
        )
      ).toBeChecked();

      expect(
        lastTimeSpan.querySelector('#time-span-state-id-0-1-toggle-button')
      ).toHaveTextContent('Itsepalvelu');

      expect(
        lastTimeSpan.querySelector('#time-span-description-0-1')
      ).toHaveValue('Viikonloppuna ovet menevät kiinni tuntia aiemmin');
    });
  });

  it('should render correct time-span-group rules', async () => {
    let container: Element;

    await act(async () => {
      container = renderEditOpeningPeriodPage();
    });

    await act(async () => {
      const periodRuleFieldset = getElementOrThrow(
        container,
        `[data-test="rule-list-item-${periodRuleId}"]`
      );

      expect(
        periodRuleFieldset.querySelector('button[id^="rule-context"]')
      ).toHaveTextContent('Jakso');

      expect(
        periodRuleFieldset.querySelector('button[id^="rule-frequency"]')
      ).toHaveTextContent('3. Parillinen');

      expect(
        periodRuleFieldset.querySelector('button[id^="rule-subject"]')
      ).toHaveTextContent('Maanantai');

      expect(
        periodRuleFieldset.querySelector('button[id^="rule-start"]')
      ).toHaveTextContent('1.');

      expect(
        periodRuleFieldset.querySelector('[data-test="rule-subject-indicator"]')
      ).toHaveTextContent('Maanantai');

      const monthRuleFieldset = getElementOrThrow(
        container,
        `[data-test="rule-list-item-${monthRuleId}"]`
      );

      expect(
        monthRuleFieldset.querySelector('button[id^="rule-context"]')
      ).toHaveTextContent('Kuukausi');

      expect(
        monthRuleFieldset.querySelector('button[id^="rule-frequency"]')
      ).toHaveTextContent('Jokainen');

      expect(
        monthRuleFieldset.querySelector('button[id^="rule-subject"]')
      ).toHaveTextContent('Viikko');

      expect(
        monthRuleFieldset.querySelector('button[id^="rule-start"]')
      ).toHaveTextContent('2.');

      expect(
        monthRuleFieldset.querySelector('[data-test="rule-subject-indicator"]')
      ).toHaveTextContent('Viikko');
    });
  });

  it('should show loading indicator while loading date period', async () => {
    jest.spyOn(api, 'getDatePeriod').mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return new Promise(() => {});
    });

    render(<EditOpeningPeriodPage resourceId="tprek:8100" datePeriodId="1" />);

    await act(async () => {
      expect(await screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Aukiolojakson muokkaus'
      );
      expect(await screen.getByText('Sivua ladataan...')).toBeInTheDocument();
    });
  });

  it('should show error notification when loading date period fails', async () => {
    const error: Error = new Error('Failed to load date period');
    const errorConsoleSpy = jest
      .spyOn(global.console, 'error')
      .mockImplementationOnce((cb) => cb);

    jest
      .spyOn(api, 'getDatePeriod')
      .mockImplementation(() => Promise.reject(error));

    render(<EditOpeningPeriodPage resourceId="tprek:8100" datePeriodId="1" />);

    await act(async () => {
      const errorHeading = await screen.getByRole('heading', { level: 1 });
      const notificationText = await screen.findByTestId(
        'error-retrieving-resource-info'
      );
      expect(errorConsoleSpy).toHaveBeenCalledWith(
        'Edit date-period - data initialization error:',
        error
      );
      expect(errorHeading).toHaveTextContent('Virhe');
      expect(notificationText).toBeInTheDocument();
    });
  });

  it('should save correct time-span data after edit', async () => {
    let container: Element;

    const patchDatePeriodSpy = jest
      .spyOn(api, 'patchDatePeriod')
      .mockImplementationOnce(() => Promise.resolve(testDatePeriod));

    await act(async () => {
      container = renderEditOpeningPeriodPage();
    });

    await act(async () => {
      await selectOption({
        container,
        id: '#time-span-state-id-0-1',
        value: 'Suljettu',
      });
    });

    await act(async () => {
      clickFormSave(container);
    });

    await act(async () => {
      const timeSpans = testDatePeriod.time_span_groups[0].time_spans;
      const modifiedOpeningPeriod = timeSpans.find(
        ({ id }) => id === weekendTimeSpanId
      );
      const rest = timeSpans.filter(({ id }) => id !== weekendTimeSpanId);

      expect(patchDatePeriodSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          time_span_groups: [
            {
              id: 1225,
              period: 1,
              rules: [
                {
                  context: 'period',
                  frequency_modifier: 'even',
                  frequency_ordinal: 3,
                  id: 10,
                  group: 1225,
                  subject: 'mon',
                  start: 1,
                },
                {
                  context: 'month',
                  frequency_modifier: null,
                  frequency_ordinal: 1,
                  id: 20,
                  group: 1225,
                  subject: 'week',
                  start: 2,
                },
              ],
              time_spans: [
                ...rest,
                {
                  ...modifiedOpeningPeriod,
                  resource_state: closedResourceState.value,
                },
              ],
            },
          ],
        })
      );

      expect(mockHistoryPush).toHaveBeenCalledWith(testResourcePageUrl);
    });
  });

  it('should save added rules after edit', async () => {
    let container: Element;

    const patchDatePeriodSpy = jest
      .spyOn(api, 'patchDatePeriod')
      .mockImplementationOnce(() => Promise.resolve(testDatePeriod));

    await act(async () => {
      container = renderEditOpeningPeriodPage();
    });

    await act(async () => {
      const addRuleButton = getElementOrThrow(
        container,
        '[data-test="add-new-rule-button-0"]'
      );
      fireEvent.click(addRuleButton);
    });

    await act(async () => {
      await selectOption({
        container,
        id: '#rule-context-0-2',
        value: 'Jakso',
      });
    });

    await act(async () => {
      await selectOption({
        container,
        id: '#rule-frequency-0-2',
        value: 'Joka toinen',
      });
    });

    await act(async () => {
      await selectOption({
        container,
        id: '#rule-subject-0-2',
        value: 'Viikko',
      });
    });

    await act(async () => {
      await selectOption({
        container,
        id: '#rule-start-0-2',
        value: '1.',
      });
    });

    await act(async () => {
      clickFormSave(container);
    });

    await act(async () => {
      const timeSpans = testDatePeriod.time_span_groups[0].time_spans;
      const { rules } = testDatePeriod.time_span_groups[0];

      expect(patchDatePeriodSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          time_span_groups: [
            {
              id: 1225,
              period: 1,
              rules: [
                ...rules,
                {
                  group: 1225,
                  context: 'period',
                  frequency_modifier: null,
                  frequency_ordinal: 2,
                  start: 1,
                  subject: 'week',
                },
              ],
              time_spans: timeSpans,
            },
          ],
        })
      );

      expect(mockHistoryPush).toHaveBeenCalledWith(testResourcePageUrl);
    });
  });

  it('should remove rule', async () => {
    let container: Element;

    const patchDatePeriodSpy = jest
      .spyOn(api, 'patchDatePeriod')
      .mockImplementationOnce(() => Promise.resolve(testDatePeriod));

    await act(async () => {
      container = renderEditOpeningPeriodPage();
    });

    await act(async () => {
      const periodRuleRemoveButton = getElementOrThrow(
        container,
        `[data-test="rule-list-item-${periodRuleId}"] [data-test^=remove-rule-button]`
      );

      fireEvent.click(periodRuleRemoveButton);
    });

    await act(async () => {
      const saveButtonSelector = '[data-test="publish-opening-period-button"]';
      const saveButton = container.querySelector(saveButtonSelector);
      if (!saveButton) {
        throw new Error(`Element with selector ${saveButton} not found`);
      }

      fireEvent.click(saveButton);
    });

    await act(async () => {
      expect(patchDatePeriodSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          time_span_groups: [
            {
              id: 1225,
              period: 1,
              rules: [
                {
                  context: 'month',
                  frequency_modifier: null,
                  frequency_ordinal: 1,
                  id: 20,
                  group: 1225,
                  subject: 'week',
                  start: 2,
                },
              ],
              time_spans: testDatePeriod.time_span_groups[0].time_spans,
            },
          ],
        })
      );

      expect(mockHistoryPush).toHaveBeenCalledWith(testResourcePageUrl);
    });
  });
});
