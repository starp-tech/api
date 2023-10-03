export * from "./Contact";
export * from "./Folder";
export * from "./User";

export interface Env {
  QUERY_SERVICE_URL: string;
  PUBLIC_FEED_PATH: string;
  SCOPE_SERVICE_URL: string;
  WRITE_USER_HASH: string;
  USER_SERVICE_URL: string;
  PARTY_MEDIA_URL: string;
  PUBLIC_PARTY_VIEW_URL: string;
  USER_PASSWORD_SALT: string;
  HASH_TEMPLATE: string;
  HASH_ALGO: string;
  SYNC_GATEWAY_URL: string;
  BUCKETS_URL: string;
  SYNC_GATEWAY_PASSWORD: string;
  SYNC_GATEWAY_USER: string;
  PUBLIC_PARTY_AUTH: string;
}
