export interface PublicAlbumOwner {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}

export interface PublicAlbumCoverFile {
  id: string;
  name?: string;
  storageUrl?: string;
}

export interface PublicAlbum {
  id: string;
  title: string;
  description?: string | null;
  isPublic: boolean;
  share_token?: string | null;
  createdAt: string;
  owner?: PublicAlbumOwner;
  coverFile?: PublicAlbumCoverFile | null;
}

export interface PublicAlbumFile {
  fileId: string;
  albumId: string;
  sortOrder: number;
  caption?: string | null;
  file: {
    id: string;
    name?: string | null;
    mimeType?: string | null;
    byteSize?: number | null;
    storageUrl?: string | null;
  };
}

export interface PublicAlbumDetail {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
  files: PublicAlbumFile[];
}

export interface CustomerPrivateAlbumCoverFile {
  id: string;
  name?: string | null;
  mimeType?: string | null;
  byteSize?: number | null;
  storageUrl?: string | null;
}

export interface CustomerPrivateAlbum {
  id: string;
  title: string;
  bookingId: string | null;
  bookingReference: string | null;
  eventDate: string | null;
  deliveredAssetCount: number;
  coverFile: CustomerPrivateAlbumCoverFile | null;
}

export type CustomerAlbumSortBy = 'createdAt' | 'updatedAt' | 'title' | 'eventDate';
export type CustomerAlbumSortOrder = 'asc' | 'desc';

export interface CustomerPrivateAlbumQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  bookingId?: string;
  sortBy?: CustomerAlbumSortBy;
  sortOrder?: CustomerAlbumSortOrder;
}

export interface CustomerPrivateAlbumPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CustomerPrivateAlbumListResult {
  data: CustomerPrivateAlbum[];
  pagination: CustomerPrivateAlbumPagination | null;
}

interface CustomerPrivateAlbumNestedPayload {
  data?: CustomerPrivateAlbum[];
  pagination?: CustomerPrivateAlbumPagination;
}

export interface CustomerPrivateAlbumListEnvelope {
  data?: CustomerPrivateAlbum[] | CustomerPrivateAlbumNestedPayload;
  pagination?: CustomerPrivateAlbumPagination;
}

export interface CustomerPrivateAlbumMediaLinks {
  thumbnailUrl: string;
  contentUrl: string;
}

export interface CustomerPrivateAlbumAsset {
  id: string;
  name?: string | null;
  mimeType?: string | null;
  byteSize?: number | null;
  protectedMedia: CustomerPrivateAlbumMediaLinks;
}

export interface CustomerPrivateAlbumCard extends CustomerPrivateAlbum {
  zipDownloadUrl: string;
  assets: CustomerPrivateAlbumAsset[];
}

export const PRIVATE_ALBUM_EMPTY_STATE_TITLE = 'No private albums available yet';
export const PRIVATE_ALBUM_DENIED_MESSAGE = 'Album not found or you do not have access.';
