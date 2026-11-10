import { createClient } from "redis"
import { REDIS_URI } from "../config.js";

export const client = createClient({
    url: REDIS_URI
});

export async function connectRedis() {
    try {
        await client.connect()
        console.log("Redis connection established ✔️");

    } catch (error) {
        console.log("Failed to establish connection ✖️");
    }
}
// client.on("error", function(err) {
//   throw err;
// });
// await client.connect()
// await client.set('foo','bar');

// // Disconnect after usage
// await client.disconnect();