exports.handler = async (event, context) => {
    // Default to true if not set, but user said they set it to false.
    // process.env.ENABLE_MUSIC will be a string "false" or "true"
    const enableMusic = process.env.ENABLE_MUSIC !== 'false';

    return {
        statusCode: 200,
        body: JSON.stringify({
            enableMusic: enableMusic
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
};
