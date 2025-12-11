const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.MONGO_URL);

const clientPromise = mongoClient.connect();

const handler = async (event) => {
    try {
        const database = (await clientPromise).db(process.env.MONGODB_DATABASE);
        const collection = database.collection("UserEmotions");

        const data = JSON.parse(event.body);

        // Data structure:
        // {
        //   alias: "PlainSnail",
        //   emotions: { Ansiedad: 23, Estrés: 40, ... },
        //   timestamp: new Date()
        // }

        await collection.insertOne({
            alias: data.alias,
            emotions: data.emotions,
            timestamp: new Date()
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Emotions saved successfully" }),
        };
    } catch (error) {
        return { statusCode: 500, body: error.toString() };
    }
};

module.exports = { handler };
