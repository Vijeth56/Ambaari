This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Setting up Postgres locally

1. Make sure Postgres is installed. Additionally can install [PgAdmin](https://www.pgadmin.org/download/) for GUI access
2. Install [Knex](https://knexjs.org/) cli
   ```
   npm install knex -g
   ```
3. Update `.env.local` file with your local postgres credentials
4. Create an empty schema named `ambaari` in postgres
5. Navigate in terminal to `[Project]/knex` folder
6. Run the following to setup required tables and views
    ```
    knex migrate:latest
    ```
7. Run the following to populate tables with seed data
   ```
    knex seed:run
   ```