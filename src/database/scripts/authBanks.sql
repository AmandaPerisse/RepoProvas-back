CREATE TABLE users
(
    id SERIAL PRIMARY KEY NOT NULL,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    "pictureUrl" TEXT NOT NULL
);

CREATE TABLE sessions
(
    id SERIAL PRIMARY KEY NOT NULL,
    token TEXT NOT NULL UNIQUE,
    "userId" INTEGER NOT NULL REFERENCES users(id)
);

CREATE TABLE "posts" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "url" TEXT NOT NULL,
  "description" TEXT,
  "likesAmount" INTEGER DEFAULT 0,
  "userId" INTEGER NOT NULL REFERENCES "users"("id")
);

CREATE TABLE "hashtags" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "name" TEXT UNIQUE NOT NULL,
  "amount" INTEGER DEFAULT 1,
  "userId" INTEGER NOT NULL REFERENCES "users"("id")
);

CREATE TABLE "hashtagsPosts" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "postId" INTEGER NOT NULL REFERENCES "posts"("id"),
  "hashtagId" INTEGER NOT NULL REFERENCES "hashtags"("id")
);

CREATE TABLE "likes" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "postId" INTEGER NOT NULL REFERENCES "posts"("id"),
  "userId" INTEGER NOT NULL REFERENCES "hashtags"("id")
);