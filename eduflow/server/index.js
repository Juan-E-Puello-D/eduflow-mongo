import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://eduflowAdmin:SH8qUIfdiTPK3asC@eduflow.bcgc5v7.mongodb.net/?appName=EduFlow";
const DATABASE_NAME = process.env.MONGODB_DB || "eduflow";

let client;
let db;

const connectDb = async () => {
  if (db) return db;

  client = new MongoClient(MONGODB_URI, {
    serverApi: {
      version: "1",
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  db = client.db(DATABASE_NAME);
  return db;
};

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", database: DATABASE_NAME });
});

app.get("/api/courses", async (_req, res) => {
  try {
    const database = await connectDb();
    const courses = await database.collection("courses").find({}).toArray();
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching courses" });
  }
});

app.get("/api/courses/:id", async (req, res) => {
  try {
    const database = await connectDb();
    const courseId = Number(req.params.id);
    const course = await database.collection("courses").findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching course" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
