import { redis, RedisClient } from "bun";

// Using the default client (reads connection info from environment)
// process.env.REDIS_URL is used by default
// await redis.set("hello", "world");
// const result = await redis.get("hello");

console.log("redis run");

// Creating a custom client
const client = new RedisClient(
  "redis://default:gQAAAAAAASBOAAIgcDE5YWUxMDRkYjA5N2M0YzkyYjI1ZWJlNzQ3Y2U5NGE3Nw@destined-guinea-73806.upstash.io:6379",
);

console.log("set to client");

await client.set("counter", "0");

await client.incr("counter");

console.log("redis client");
