export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export type RequestConfigWithRetry = {
  headers?: Record<string, string>;
  skipAuthRedirect?: boolean;
};
