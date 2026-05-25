import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "eduflow";

if (!URI) throw new Error("MONGODB_URI is not defined in .env");

let client;
let db;

export const connectDb = async () => {
  if (db) return db;
  client = new MongoClient(URI, {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
  });
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`Connected to MongoDB: ${DB_NAME}`);
  return db;
};

export const getDb = () => {
  if (!db) throw new Error("DB not initialized. Call connectDb() first.");
  return db;
};
