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
