import { createDatabase } from '@openclaw-webapp-kit/data';
type Schema = { notes: { id: string; text: string } };
export const db = createDatabase<Schema>({appId:'__APP_ID__',versions:[{version:1,stores:{notes:'id'}}]});
// Extend schema and seed for the user's product; do not change appId on follow-ups.
// Scaffold or Vite initializes the placeholder once; never randomize it in the browser.
export const ready = db.seedOnce('initial-v1', async () => { await db.table('notes').add({id:'welcome',text:''}); });
