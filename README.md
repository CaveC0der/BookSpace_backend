
# BookSpace REST API

Backend for future BookSpace web app


## Tech Stack

- NestJS
- PostgreSQL
- Sequelize

## Run Locally

- Install dependencies

```bash
  npm install
```

- Create .env file with the following variables

`NODE_ENV`

`PORT`

`DB_DIALECT`
`DB_HOST`
`DB_PORT`
`DB_USERNAME`
`DB_PASSWORD`
`DB_NAME`

`SALT_LENGTH`

`JWT_ALGORITHM`

`JWT_ACCESS_SECRET`
`JWT_ACCESS_EXPIRES_IN`

`JWT_REFRESH_SECRET`
`JWT_REFRESH_EXPIRES_IN`

`COOKIE_NAME`
`COOKIE_MAX_AGE`

`SERVE_STATIC_FOLDER`
`SERVE_STATIC_PREFIX`

`THROTTLER_TTL`
`THROTTLER_LIMIT`

Check src/shared/joi/config-validation-schema.ts

- Run SQL from sql/start.sql

- Start the server

```bash
  npm run start
```


## Documentation

Made with Swagger, will be available at /docs once app starts.
