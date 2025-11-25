const { connectToDatabase } = require('../../lib/db');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Allow keeping the connection alive for performance
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const body = JSON.parse(event.body);
        const { testId, answers, timestamp } = body;

        if (!answers) {
            return { statusCode: 400, body: 'Answers are required' };
        }

        const { db } = await connectToDatabase();
        const collection = db.collection('test_results');

        await collection.insertOne({
            testId,
            answers,
            timestamp: new Date(timestamp || Date.now()),
            createdAt: new Date()
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Test saved successfully' }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.error('Error saving test:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
