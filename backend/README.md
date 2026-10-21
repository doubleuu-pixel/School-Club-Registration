# School Club Registration Backend

Backend API using Node.js, ExpressJS, and MongoDB. No authentication is implemented.

## Requirements

- Node.js 18 or later
- MongoDB running locally, or a MongoDB Atlas connection string

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and update `MONGODB_URI` if needed.

   Windows Command Prompt:

   ```bat
   copy .env.example .env
   ```

   PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Start the server:

   ```bash
   npm run dev
   ```

   Or run without nodemon:

   ```bash
   npm start
   ```

The server starts at `http://localhost:5000`.

## GET endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API health and endpoint list |
| GET | `/api/clubs` | List clubs |
| GET | `/api/clubs/:id` | Get one club and member count |
| GET | `/api/clubs/:id/registrations` | List registrations for a club |
| GET | `/api/registrations` | List registrations |
| GET | `/api/registrations/:id` | Get one registration |
| GET | `/api/dashboard/stats` | Dashboard counts and registrations per club |

## Query examples

- `/api/clubs?search=science`
- `/api/clubs?status=Active&category=Academic`
- `/api/registrations?search=Juan`
- `/api/registrations?clubId=YOUR_CLUB_OBJECT_ID`
- `/api/registrations?status=Approved&page=1&limit=10`
- `/api/clubs/YOUR_CLUB_OBJECT_ID/registrations?status=Approved&search=Juan`

Use real MongoDB ObjectIds in place of the example IDs.

## Example responses

`GET /api/clubs`:

```json
{
  "count": 1,
  "data": [
    {
      "_id": "678000000000000000000001",
      "clubName": "Science Club",
      "description": "Promotes science activities",
      "category": "Academic",
      "adviser": "Ms. Santos",
      "maxMembers": 40,
      "status": "Active",
      "registeredMembers": 12
    }
  ]
}
```

`GET /api/registrations` returns `count`, `total`, `page`, `pages`, and `data`.
Each registration's `clubId` is populated with club name, category, and status.

## Notes

- Mongoose creates the collections when records are first inserted.
- GET endpoints do not require seeded data; they return empty arrays/counts when the database is empty.
- This starter includes GET routes only. POST, PUT, and DELETE routes can be added next.
- Authentication is intentionally omitted for this checkpoint. Do not expose student data publicly in production.
