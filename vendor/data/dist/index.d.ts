import { Dexie, type Table, type Transaction } from 'dexie';
export { liveQuery } from 'dexie';
export type { Table, Transaction } from 'dexie';
export type Row = {
    id: string;
};
export type StableIdIndexes = 'id' | `id,${string}`;
export type SchemaVersion = {
    version: number;
    /** Dexie index syntax. Every record has a stable string id primary key. */
    stores: Record<string, StableIdIndexes | null>;
    upgrade?: (transaction: Transaction) => void | PromiseLike<unknown>;
};
export type DatabaseOptions = {
    appId: string;
    versions: SchemaVersion[];
};
/** Browser-local storage. Does not implement authentication, cloud sync or SQL. */
export declare class LocalDatabase<S extends {
    [K in keyof S]: Row;
}> {
    readonly native: Dexie;
    constructor(options: DatabaseOptions);
    table<K extends keyof S & string>(name: K): Table<S[K], string>;
    open(): Promise<void>;
    close(): void;
    /** Seed and marker commit together. Reopening, deleting rows or mounting twice never re-seeds. */
    seedOnce(key: string, populate: () => Promise<unknown>): Promise<boolean>;
    /** Only IndexedDB operations inside the callback; no timers/network awaits. */
    transaction<T>(tables: (keyof S & string)[], action: () => Promise<T>): Promise<T>;
}
export declare function createDatabase<S extends {
    [K in keyof S]: Row;
}>(options: DatabaseOptions): LocalDatabase<S>;
