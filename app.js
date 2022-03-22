import cors from 'cors';
import dotenv from 'dotenv';
import express, { json } from 'express';
dotenv.config();

const app = express();
app.use(cors());
app.use(json());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
})