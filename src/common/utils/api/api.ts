import axios, { AxiosResponse } from 'axios';
import { DatePeriod } from '../../lib/types';
import { AuthTokens } from '../../../auth/auth-context';

const apiBaseUrl: string = window.ENV?.API_URL || 'http://localhost:8000';

const resourceBasePath = '/resource';
const datePeriodBasePath = '/date_period';
const authRequiredTest = '/auth_required_test';

interface RequestParameters {
  [key: string]:
    | string
    | number
    | boolean
    | ReadonlyArray<string>
    | ReadonlyArray<number>
    | ReadonlyArray<boolean>
    | undefined
    | null;
}

interface GetParameters {
  path: string;
  headers?: { [key: string]: string };
  parameters?: RequestParameters;
}

enum ApiResponseFormat {
  json = 'json',
}

interface ApiParameters extends RequestParameters {
  format: ApiResponseFormat;
}

async function apiGet<T>({
  path,
  headers = {},
  parameters = {},
}: GetParameters): Promise<T> {
  const apiParameters: ApiParameters = {
    ...parameters,
    format: ApiResponseFormat.json,
  };

  try {
    const response: AxiosResponse<T> = await axios.request<T, AxiosResponse<T>>(
      {
        url: `${apiBaseUrl}/v1${path}`,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        method: 'get',
        params: apiParameters,
      }
    );
    return response.data;
  } catch (error) {
    const errorMessage: string | undefined = error.response?.data?.detail;
    if (errorMessage) {
      throw new Error(errorMessage);
    } else {
      throw new Error(error);
    }
  }
}

export interface Resource {
  id: string;
  name: {
    fi: string;
    sv: string;
    en: string;
  };
  description: {
    fi: string;
    sv: string;
    en: string;
  };
  address: {
    fi: string;
    sv: string;
    en: string;
  };
  extra_data: {
    citizen_url: string;
    admin_url: string;
  };
}

interface AuthTestResponse {
  message: string;
  username: string;
}

interface ListResponse<T> {
  results: T[];
}

export default {
  getResource: (id: string): Promise<Resource> =>
    apiGet<Resource>({ path: `${resourceBasePath}/${id}` }),

  getDatePeriod: (resourceId: string): Promise<DatePeriod[]> =>
    apiGet<ListResponse<DatePeriod>>({
      path: `${datePeriodBasePath}`,
      parameters: { resource: resourceId },
    }).then((response) => {
      return response.results;
    }),

  testAuthCredentials: (authTokens: AuthTokens): Promise<AuthTestResponse> => {
    const { signature, ...restOfTokens } = authTokens;

    return apiGet<AuthTestResponse>({
      path: `${authRequiredTest}`,
      headers: {
        Authorization: `haukisigned signature=${signature}`,
      },
      parameters: { ...restOfTokens },
    });
  },
};
