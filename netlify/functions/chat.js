const { getChatResponse } = require('../../lib/geminiClient');
const { connectToDatabase } = require('../../lib/db');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Allow keeping the connection alive for performance
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const body = JSON.parse(event.body);
        const { history, message } = body;

        if (!message) {
            return { statusCode: 400, body: 'Message is required' };
        }

        // Get response from Gemini
        const responseText = await getChatResponse(history || [], message);

        return {
            statusCode: 200,
            body: JSON.stringify({ response: responseText }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.error('Error in chat function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

