export interface UserInfo {
  id: string;
  idHash: string;
  version: string;
  handle: string;
  photo: string;
  description: string;
  email?: string;
  name: string;
  prevVersion: string;
  userDoc: boolean;
  year: string;
}

export interface UserDocRes {
  docs: UserInfo[];
}
