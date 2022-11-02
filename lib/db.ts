import knex from "knex";

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;

export const db = knex({
  client: "pg",
  connection: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/ambaari`,
  searchPath: ["knex", "public"],
  pool: {
    min: 0,
    max: 10,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 1500,
    createRetryIntervalMillis: 500,
    propagateCreateError: false,
  },
});
