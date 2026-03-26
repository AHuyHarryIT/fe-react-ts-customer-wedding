export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export type RequestConfigWithRetry = {
  _retry?: boolean;
  headers?: Record<string, string>;
  skipAuthRedirect?: boolean;
};
