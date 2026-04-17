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
  createdAt: string;
  owner?: PublicAlbumOwner;
  coverFile?: PublicAlbumCoverFile | null;
}

export interface CustomerPrivateAlbumCoverFile {
  id: string;
  name?: string | null;
  mimeType?: string | null;
  byteSize?: number | null;
}

export interface CustomerPrivateAlbum {
  id: string;
  title: string;
  bookingId: string | null;
  eventDate: string | null;
  deliveredAssetCount: number;
  coverFile: CustomerPrivateAlbumCoverFile | null;
}
