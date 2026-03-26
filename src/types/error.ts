export interface ApiErrorData {
  success: boolean;
  statusCode?: number;
  code?: string;
  message: string;
  error?: {
    code?: string;
    details?: unknown;
  };
}
