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

        // Save to MongoDB
        try {
            const { db } = await connectToDatabase();
            const chatCollection = db.collection('chats');

            await chatCollection.insertOne({
                timestamp: new Date(),
                userMessage: message,
                assistantResponse: responseText,
                // We could add a sessionId here if the client sends one
                metadata: {
                    detectedState: responseText.includes('[ESTADO:') ? responseText.match(/\[ESTADO: (.*?)\]/)[1] : null
                }
            });
        } catch (dbError) {
            console.error('Failed to save to MongoDB:', dbError);
            // We don't fail the request if DB save fails, just log it
        }

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

