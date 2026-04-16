export interface ApiErrorFieldDetail {
  field: string;
  code?: string;
  message: string;
}

export interface ApiErrorDetails {
  fields?: ApiErrorFieldDetail[];
  [key: string]: unknown;
}

export interface ApiErrorData {
  success: boolean;
  statusCode?: number;
  code?: string;
  message: string;
  details?: ApiErrorDetails;
  error?: {
    code?: string;
    details?: ApiErrorDetails;
  };
}
