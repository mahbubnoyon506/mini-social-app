# Mini Social Feed — Backend

Node.js + Express + MongoDB (Mongoose) API for the Mini Social Feed App, with JWT
authentication and Firebase Cloud Messaging (FCM) push notifications on likes/comments.

## Tech Stack

- Node.js / Express
- MongoDB / Mongoose
- JWT (jsonwebtoken) authentication
- express-validator for request validation
- firebase-admin for FCM push notifications
- bcryptjs for password hashing

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── firebase.js        # Firebase Admin SDK init (FCM)
│   ├── controllers/
│   │   ├── authController.js
│   │   └── postController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── validate.js        # express-validator error formatting
│   ├── models/
│   │   ├── User.js
│   │   └── Post.js            # posts, embedded likes + comments
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── postRoutes.js
│   ├── utils/
│   │   └── sendNotification.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## Setup

### 1. Prerequisites
- Node.js 18+
- A running MongoDB instance (local or MongoDB Atlas)
- A Firebase project (for push notifications) — optional but recommended

### 2. Install dependencies
```bash
cd backend
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Fill in `.env`:
| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Path to Firebase service account JSON (see below) |
| `CLIENT_ORIGIN` | CORS origin, `*` for development |

### 4. Firebase setup (for push notifications)
1. Go to the [Firebase Console](https://console.firebase.google.com/) → create/select a project.
2. Project Settings → Service Accounts → **Generate new private key**.
3. Save the downloaded JSON as `backend/serviceAccountKey.json` (already git-ignored).
4. Make sure `FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json` in `.env`.

If this file is absent, the server still runs fine — it just logs a warning and skips
sending push notifications (likes/comments still work normally).

### 5. Run the server
```bash
npm run dev     # with nodemon (auto-restart)
# or
npm start
```
API will be available at `http://localhost:5000`.

## API Reference

All endpoints return JSON. Protected endpoints require:
```
Authorization: Bearer <JWT token>
```

### Auth

#### `POST /api/auth/signup`
Create a new account.

Request body:
```json
{ "username": "alice", "email": "alice@example.com", "password": "secret123" }
```
Response `201`:
```json
{ "token": "<jwt>", "user": { "id": "...", "username": "alice", "email": "alice@example.com", "createdAt": "..." } }
```

#### `POST /api/auth/login`
```json
{ "email": "alice@example.com", "password": "secret123" }
```
Response `200`: same shape as signup.

#### `GET /api/auth/me` 🔒
Returns the authenticated user's profile.

#### `PATCH /api/auth/fcm-token` 🔒
Registers/updates the device's FCM token so the backend can push notifications to it.
```json
{ "fcmToken": "<expo/fcm device token>" }
```

### Posts

#### `POST /api/posts` 🔒
Create a text-only post.
```json
{ "text": "Hello world!" }
```
Response `201`: `{ "post": { ...feed post object } }`

#### `GET /api/posts?page=1&limit=10&username=alice` 🔒
Paginated feed, newest first. `username` is optional and filters posts to one author.

Response `200`:
```json
{
  "posts": [
    {
      "id": "...",
      "text": "Hello world!",
      "author": { "id": "...", "username": "alice" },
      "likeCount": 2,
      "likedByMe": false,
      "commentCount": 1,
      "comments": [ { "id": "...", "text": "Nice!", "author": { "id": "...", "username": "bob" }, "createdAt": "..." } ],
      "createdAt": "..."
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 42,
  "totalPages": 5
}
```
`comments` in the feed list is capped to the 3 most recent for payload size; the mobile
app can request the full list from a dedicated view if needed.

#### `POST /api/posts/:id/like` 🔒
Toggles a like (like if not liked, unlike if already liked). Triggers a push
notification to the post's author (unless they're liking their own post).

Response `200`: `{ "liked": true, "likeCount": 3 }`

#### `POST /api/posts/:id/comment` 🔒
Adds a comment. Triggers a push notification to the post's author.
```json
{ "text": "Great post!" }
```
Response `201`: `{ "comment": { ... }, "commentCount": 4 }`

## Error format
Validation errors:
```json
{ "message": "Validation failed", "errors": [ { "field": "email", "message": "A valid email is required" } ] }
```
Other errors: `{ "message": "..." }` with an appropriate HTTP status code.

## Notes / Design decisions
- Comments and likes are embedded inside the `Post` document (simplest model for a
  "mini" app at this scale); this can be split into separate collections later if the
  comment volume per post grows large.
- Likes are stored as an array of user ObjectIds so "like/unlike" is a single toggle
  endpoint rather than two.
- Notification sending is fire-and-forget and never blocks or fails the API response —
  if FCM/Firebase isn't configured, the like/comment endpoints still succeed.
