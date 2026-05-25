import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb+srv://eduflowAdmin:SH8qUIfdiTPK3asC@eduflow.bcgc5v7.mongodb.net";
const dbName = process.env.MONGODB_DB || "eduflow";
const dataDir = path.join(process.cwd(), "data");

const collections = [
  { file: "usuarios.json", name: "usuarios" },
  { file: "cursos.json", name: "cursos" },
  { file: "inscripciones.json", name: "inscripciones" },
  { file: "comentarios.json", name: "comentarios" },
];

const importCollection = async (db, fileName, collectionName) => {
  const filePath = path.join(dataDir, fileName);
  const dataText = await fs.readFile(filePath, "utf8");
  const docs = JSON.parse(dataText);
  if (!Array.isArray(docs)) {
    throw new Error(`${fileName} must contain a JSON array`);
  }

  const collection = db.collection(collectionName);
  await collection.deleteMany({});
  if (docs.length > 0) {
    await collection.insertMany(docs);
  }
  console.log(`Imported ${docs.length} documents into ${collectionName}`);
};

const main = async () => {
  console.log(`Connecting to ${uri}/${dbName}...`);
  const client = new MongoClient(uri, { serverApi: { version: "1", strict: true, deprecationErrors: true } });
  await client.connect();
  const db = client.db(dbName);

  for (const { file, name } of collections) {
    await importCollection(db, file, name);
  }

  await client.close();
  console.log("Seed import completed.");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
