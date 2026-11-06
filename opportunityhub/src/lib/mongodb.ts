import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { seedOpportunities } from "./seed";

/**
 * MongoDB connection helper (the "M" in MERN).
 *
 * - If MONGODB_URI is set (e.g. on Vercel -> MongoDB Atlas), we connect to it.
 * - If it is NOT set (local dev / first run), we spin up a temporary
 *   in-memory MongoDB so the app works instantly with zero setup.
 */

interface MongoCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  memoryServer?: MongoMemoryServer;
}

// Cache the connection on globalThis so hot-reload doesn't create
// a new connection on every file change (standard Next.js pattern).
const globalMongo = globalThis as unknown as { __mongoCache?: MongoCache };
const cache: MongoCache = globalMongo.__mongoCache ?? { conn: null, promise: null };
globalMongo.__mongoCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  // Already connected -> reuse it.
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = (async () => {
      const uri = process.env.MONGODB_URI;

      if (uri) {
        // Production path: MongoDB Atlas connection string from .env / Vercel
        console.log("[db] Connecting to MongoDB Atlas...");
        const conn = await mongoose.connect(uri);
        await seedIfEmpty();
        return conn;
      }

      // Demo path: temporary in-memory database (data resets on restart)
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "MONGODB_URI is not set. Add your MongoDB Atlas connection string in the Vercel environment variables."
        );
      }
      console.log("[db] MONGODB_URI not set - starting in-memory MongoDB for local demo...");
      cache.memoryServer = await MongoMemoryServer.create();
      const demoUri = cache.memoryServer.getUri("opportunityhub");
      const conn = await mongoose.connect(demoUri);
      await seedOpportunities();
      return conn;
    })();
  }

  try {
    cache.conn = await cache.promise;
  } catch (e) {
    cache.promise = null; // allow retry on next request
    throw e;
  }
  return cache.conn;
}

/** Seed sample opportunities into a fresh (empty) database - e.g. first Atlas run. */
async function seedIfEmpty() {
  const Opportunity = (await import("./opportunity")).Opportunity;
  const count = await Opportunity.countDocuments();
  if (count === 0) {
    console.log("[db] Empty database detected - seeding sample opportunities...");
    await seedOpportunities();
  }
}
