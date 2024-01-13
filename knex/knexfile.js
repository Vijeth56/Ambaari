// require('dotenv').config({ path: '../.env.local' });
require('dotenv').config({ path: '../.env.prod' });

module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: 'ambaari',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'ambaari',
      host: process.env.PROD_DB_HOST,
      user: process.env.PROD_DB_USER,
      password: process.env.PROD_DB_PASSWORD
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    }
  }
};