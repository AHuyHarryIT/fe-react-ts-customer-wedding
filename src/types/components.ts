import type { Package } from './package';

export interface NavigationProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export interface AuthPageProps {
  onLogin: (phoneNumber: string) => void;
}

export interface BookingDetailPageProps {
  bookingId?: string;
  onBack: () => void;
  onMessages: () => void;
}

export interface BookingFlowPageProps {
  initialPackageId?: string;
  onBack: () => void;
}

export interface PackageDetailPageProps {
  packageData: Package;
  onBack: () => void;
}
