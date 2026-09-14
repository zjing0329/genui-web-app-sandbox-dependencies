import { Dexie } from 'dexie';
export { liveQuery } from 'dexie';
const META = '__kit_meta';
/** Browser-local storage. Does not implement authentication, cloud sync or SQL. */
export class LocalDatabase {
    native;
    constructor(options) {
        if (!/^[a-z0-9][a-z0-9-]{0,95}$/.test(options.appId))
            throw new Error('appId must be a stable lowercase slug (1-96 characters)');
        if (!options.versions.length)
            throw new Error('At least one schema version is required');
        let previous = 0;
        for (const version of options.versions) {
            if (!Number.isSafeInteger(version.version) || version.version <= previous)
                throw new Error('Schema versions must be increasing positive integers');
            previous = version.version;
            for (const [name, indexes] of Object.entries(version.stores)) {
                if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name))
                    throw new Error('Table names must start with a letter; internal names are reserved');
                if (indexes !== null && indexes.split(',')[0].trim() !== 'id')
                    throw new Error(`${name}: first index must be id (a stable string primary key)`);
            }
        }
        this.native = new Dexie(`webapp-kit:${options.appId}`);
        for (const version of options.versions) {
            const v = this.native.version(version.version).stores({ ...version.stores, [META]: 'id' });
            if (version.upgrade)
                v.upgrade(version.upgrade);
        }
    }
    table(name) {
        if (name === META)
            throw new Error('Internal metadata is reserved');
        return this.native.table(name);
    }
    async open() { await this.native.open(); }
    close() { this.native.close(); }
    /** Seed and marker commit together. Reopening, deleting rows or mounting twice never re-seeds. */
    async seedOnce(key, populate) {
        if (!key.trim())
            throw new Error('Seed key must not be empty');
        await this.open();
        return this.native.transaction('rw', this.native.tables, async () => {
            const meta = this.native.table(META);
            if (await meta.get(`seed:${key}`))
                return false;
            await populate();
            await meta.add({ id: `seed:${key}` });
            return true;
        });
    }
    /** Only IndexedDB operations inside the callback; no timers/network awaits. */
    async transaction(tables, action) {
        if (!tables.length)
            throw new Error('Transaction must include at least one table');
        return this.native.transaction('rw', tables.map(name => this.table(name)), action);
    }
}
export function createDatabase(options) {
    return new LocalDatabase(options);
}
