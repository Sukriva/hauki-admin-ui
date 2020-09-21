import axios, { AxiosResponse } from 'axios';

const apiBaseUrl: string = window.ENV?.API_URL || 'http://localhost:8000';

const TARGET_BASE_PATH = '/target';

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
  parameters?: RequestParameters;
}

enum ApiResponseFormat {
  json = 'json',
}

interface ApiParameters extends RequestParameters {
  format: ApiResponseFormat;
}

async function apiGet<T>({ path, parameters = {} }: GetParameters): Promise<T> {
  const apiParameters: ApiParameters = {
    ...parameters,
    format: ApiResponseFormat.json,
  };
  const response: AxiosResponse<T> = await axios.request<T, AxiosResponse<T>>({
    url: `${apiBaseUrl}/v1${path}`,
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'get',
    params: apiParameters,
  });

  return response.data;
}

export interface Target {
  id: string;
  name: string;
  description: string;
}

export default {
  getTarget: (id: string): Promise<Target> =>
    apiGet<Target>({ path: `${TARGET_BASE_PATH}/tprek:${id}` }),
};