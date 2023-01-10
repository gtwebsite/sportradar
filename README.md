# SportRadar Advanced Challenge

## Requirement

- Node 16.x.x
- Yarn 1.2.x
- Postgres 11.x.x

## Tech Stack

- Vite
- React
- Express.js

## Setup Postgres

1. Follow https://www.postgresqltutorial.com/postgresql-getting-started/install-postgresql-macos/
1. Create a database for this project

## Usage

1. Open 2 terminals, for both backend and frontend
1. Navigate each to correct folders in this repo, `cd backend` and `cd frontned`
1. Update `backend/.env` to your postgres database
1. In your backend folder, run `npx prisma migrate dev`
1. Run `yarn` for both folders
1. Run `yarn dev` for both folders
1. Visit `http://localhost:3001` for frontend, and endpoint for your API is `http://localhost:5001`

## Test

1. Run `yarn test`
