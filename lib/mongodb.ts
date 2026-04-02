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
    // minPoolSize intentionally omitted — serverless functions must not maintain
    // background connections; they connect on demand and let the pool idle.
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 30000,
  })

  return client.connect().catch((err) => {
    // Clear cached promise on failure so next call retries
    global._mongoClientPromise = undefined
    throw err
  })
}

// Cache the client promise in global so it is reused across:
//  - hot reloads in development
//  - warm serverless invocations in production (same function instance)
if (!global._mongoClientPromise) {
  global._mongoClientPromise = createClientPromise()
}

const clientPromise: Promise<MongoClient> = global._mongoClientPromise

export default clientPromise
