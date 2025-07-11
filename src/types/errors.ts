import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  statusCode?: number;
}

export type ApiAxiosError = AxiosError<ApiErrorResponse>;
