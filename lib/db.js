const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const uri = process.env.MONGO_URL;
    if (!uri) {
        throw new Error('Please define the MONGO_URL environment variable inside Netlify');
    }

    const client = await MongoClient.connect(uri, {
        // These options are no longer needed in modern drivers but good to know
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
    });

    const db = client.db(); // Uses the database name from the connection string

    cachedClient = client;
    cachedDb = db;

    return { client, db };
}

module.exports = { connectToDatabase };
