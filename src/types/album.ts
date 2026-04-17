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
  bookingReference: string | null;
  eventDate: string | null;
  deliveredAssetCount: number;
  coverFile: CustomerPrivateAlbumCoverFile | null;
}

export interface CustomerPrivateAlbumMediaLinks {
  thumbnailUrl: string;
  contentUrl: string;
}

export interface CustomerPrivateAlbumCard extends CustomerPrivateAlbum {
  protectedMedia: CustomerPrivateAlbumMediaLinks | null;
}

export interface CustomerPrivateAlbumListEnvelope {
  data?:
    | CustomerPrivateAlbum[]
    | {
        data?: CustomerPrivateAlbum[];
      };
}

export const PRIVATE_ALBUM_EMPTY_STATE_TITLE = 'No private albums available yet';
export const PRIVATE_ALBUM_DENIED_MESSAGE = 'Album not found or you do not have access.';
