export interface PackageImage {
  id: string;
  imageUrl: string;
  sortOrder: number;
}

export interface PackageService {
  id: string;
  name: string;
  description?: string | null;
  price?: number;
}

export interface PackageServiceSelection {
  serviceId: string;
  service?: PackageService;
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive?: boolean;
  coverImageUrl?: string | null;
  images?: PackageImage[];
  services?: PackageServiceSelection[];
  createdAt?: string;
  updatedAt?: string;
  duration?: number;
  features?: string[];
  image?: string;
  category?: string;
}

export interface PackagePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type PackageListPayload = Package[];

export interface PackageParams {
  packageId: string;
}
