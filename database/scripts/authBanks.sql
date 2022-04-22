CREATE TABLE "users"(
    "id" SERIAL PRIMARY KEY NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL
);

CREATE TABLE "sessions"(
    "id" SERIAL PRIMARY KEY NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "userId" INTEGER NOT NULL REFERENCES users(id)
);

CREATE TABLE "categories"(
    "id" SERIAL PRIMARY KEY NOT NULL,
    "name" TEXT UNIQUE NOT NULL
);

CREATE TABLE "terms" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "number" INTEGER UNIQUE NOT NULL
);

CREATE TABLE "disciplines" (
	"id" SERIAL PRIMARY KEY NOT NULL,
	"name" TEXT UNIQUE NOT NULL,
	"termId" INTEGER NOT NULL REFERENCES "terms"("id")
);

CREATE TABLE "teachers" (
	"id" SERIAL PRIMARY KEY NOT NULL,
	"name" TEXT UNIQUE NOT NULL
);

CREATE TABLE "teachersDisciplines" (
	"id" SERIAL PRIMARY KEY NOT NULL,
	"teacherId" INTEGER NOT NULL REFERENCES "teachers"("id"),
	"disciplineId" INTEGER NOT NULL REFERENCES "disciplines"("id")
);

CREATE TABLE "tests"(
	"id" SERIAL PRIMARY KEY NOT NULL,
	"name" TEXT NOT NULL,
	"pdfUrl" TEXT NOT NULL,
	"categoryId" INTEGER NOT NULL REFERENCES "categories"("id"),
	"teacherDisciplineId" INTEGER NOT NULL REFERENCES "teachersDisciplines"("id")
);
