import mongoose from "mongoose"

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: Promise<typeof mongoose> | undefined
}

async function connectDB(): Promise<void> {
  // Already connected
  if (mongoose.connection.readyState === 1) return

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("Please add your MONGODB_URI to .env.local")

  // If a connection attempt is in progress, wait for it
  if (global._mongooseConn) {
    await global._mongooseConn
    return
  }

  const promise = mongoose
    .connect(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 })
    .catch((err) => {
      // Clear so next call retries
      global._mongooseConn = undefined
      throw err
    })

  if (process.env.NODE_ENV === "development") {
    global._mongooseConn = promise
  }

  await promise
}

export default connectDB
