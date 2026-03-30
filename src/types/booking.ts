export interface BookingPackage {
  id: string;
  name: string;
  description?: string;
  price: number;
}

export interface BookingPackageSelection {
  packageId: string;
  price?: number;
  quantity?: number;
  package?: BookingPackage;
}

export interface BookingService {
  id: string;
  name: string;
  description?: string | null;
  price?: number;
}

export interface BookingServiceSelection {
  serviceId: string;
  price?: number;
  service?: BookingService;
}

export interface Photographer {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

export interface BookingSession {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
}

export interface Booking {
  id: string;
  customerId: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  totalPrice?: number;
  eventDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
  packages?: BookingPackageSelection[];
  package?: BookingPackage;
  services?: BookingServiceSelection[];
  sessions?: BookingSession[];
  staffName?: string;
  customer?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber: string;
  };
  order?: {
    id: string;
    summary: {
      totalPrice: number;
      totalPaid: number;
      balanceRemaining: number;
      isPaid: boolean;
      isPartiallyPaid: boolean;
    };
  };
}

export interface CreateBookingRequest {
  customerId?: string;
  packageIds?: string[];
  serviceIds?: string[];
  notes?: string;
  eventDate: string;
  totalPrice?: number;
}

export interface StandardResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
}

export type BookingListPayload =
  | Booking[]
  | {
      data?: Booking[];
      pagination?: unknown;
    };
