const test = require('node:test');
const assert = require('node:assert/strict');

test('connectDB does not exit the process when MongoDB is unavailable', async () => {
    const originalExit = process.exit;
    const originalMongoUri = process.env.MONGO_URI;
    const exitCalls = [];

    process.exit = ((code) => {
        exitCalls.push(code);
        throw new Error(`process.exit:${code}`);
    });

    process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/mini-social-feed';

    try {
        const connectDB = require('../src/config/db');
        const result = await connectDB();

        assert.equal(result, null);
        assert.deepEqual(exitCalls, []);
    } finally {
        process.exit = originalExit;

        if (originalMongoUri === undefined) {
            delete process.env.MONGO_URI;
        } else {
            process.env.MONGO_URI = originalMongoUri;
        }

        delete require.cache[require.resolve('../src/config/db')];
    }
});
