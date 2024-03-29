export interface KVStore {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set<T = unknown>(key: string, data: T | null): Promise<void>;
  prefix(): string;
  type?(): KVStoreType;
}

export interface KVStoreProvider {
  get(): Promise<{ [key: string]: any }>;
  set(items: { [key: string]: any }): Promise<void>;
}

export enum KVStoreType {
  extension = "extension",
  mobile = "mobile",
}
