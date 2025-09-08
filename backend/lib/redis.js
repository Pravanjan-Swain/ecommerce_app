// import Redis from "ioredis";
// import dotenv from "dotenv";

// dotenv.config();

// export const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN
// })

// export const redis = new Redis(process.env.UPSTASH_REDIS_URL);


import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';   

dotenv.config();

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})