import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Data paths
  const QUESTIONS_FILE = path.join(__dirname, "server/data/questions.json");
  const PROGRESS_FILE = path.join(__dirname, "server/data/progress.json");

  // Helper to read JSON
  const readJson = (file: string) => {
    try {
      if (!fs.existsSync(file)) {
        // Create directory if it doesn't exist
        const dir = path.dirname(file);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(file, JSON.stringify([]));
        return [];
      }
      const data = fs.readFileSync(file, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
      return [];
    }
  };

  // Helper to write JSON
  const writeJson = (file: string, data: any) => {
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${file}:`, error);
      return false;
    }
  };

  // API Routes
  app.get("/api/questions", (req, res) => {
    const questions = readJson(QUESTIONS_FILE);
    const { topic, difficulty } = req.query;
    
    let filtered = questions;
    if (topic && topic !== "All") {
      filtered = filtered.filter((q: any) => q.topic === topic);
    }
    if (difficulty && difficulty !== "All") {
      filtered = filtered.filter((q: any) => q.difficulty === difficulty);
    }
    
    res.json(filtered);
  });

  app.get("/api/progress", (req, res) => {
    const progress = readJson(PROGRESS_FILE);
    res.json(progress);
  });

  app.post("/api/progress", (req, res) => {
    const progress = readJson(PROGRESS_FILE);
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...req.body
    };
    progress.push(newEntry);
    writeJson(PROGRESS_FILE, progress);
    res.status(201).json(newEntry);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
