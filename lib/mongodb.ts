import { MongoClient } from "mongodb"

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("Please add your MONGODB_URI to .env.local")

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  })

  return client.connect().catch((err) => {
    // Clear cached promise on failure so next call retries
    if (process.env.NODE_ENV === "development") {
      global._mongoClientPromise = undefined
    }
    throw err
  })
}

// Reuse connection across hot reloads in development; fresh per deployment in production
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production, reuse at module level (one module per instance)
  clientPromise = createClientPromise()
}

export default clientPromise
