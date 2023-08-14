export interface Folder {
  id: string;
  isFolder: boolean;
  userId: string;
  folderType: FolderType;
  title: string;
  isOpen?: boolean;
  date: number;
  isEditing?: boolean;
  isInfoOpen?: boolean;
  sortId?: number;
}

export enum FolderType {
  contact = 'contact',
  media = 'media',
  property = 'property'
}

export interface FolderRes {
  docs: Folder[];
}
