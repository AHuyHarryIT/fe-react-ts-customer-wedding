export type AppPage =
  | 'home'
  | 'auth'
  | 'packages'
  | 'package-detail'
  | 'booking'
  | 'dashboard'
  | 'booking-detail'
  | 'gallery'
  | 'messages'
  | 'profile'
  | 'contact';

export type PageNavigationData = {
  package?: {
    id: string | number;
    name?: string;
    price?: number;
  };
};
