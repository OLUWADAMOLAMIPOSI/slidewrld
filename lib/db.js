import { JSONPreset } from "lowdb/node";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

const defaultData = {
  products: [],
  orders: [],
  subscribers: [],
  settings: {},
};

let dbInstance = null;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await JSONPreset(DB_PATH, defaultData);
  }
  await dbInstance.read();
  return dbInstance;
}

export async function readData() {
  const db = await getDb();
  return db.data;
}

export async function writeData(mutator) {
  const db = await getDb();
  mutator(db.data);
  await db.write();
  return db.data;
}
