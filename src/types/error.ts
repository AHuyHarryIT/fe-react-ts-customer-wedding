export interface ApiErrorData {
  success: boolean;
  statusCode?: number;
  code?: string;
  message: string;
  details?: unknown;
  error?: {
    code?: string;
    details?: unknown;
  };
}
