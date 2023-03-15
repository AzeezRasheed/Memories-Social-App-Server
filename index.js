import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import cloudinary from "cloudinary";

import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/not-found.js";
import { connectDB } from "./db/connect.js";

import { UserRoutes } from "./routes/userRoute.js";
import { PostRoutes } from "./routes/postRoute.js";

const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Origin-Headers",
    "origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: ["http://localhost:5000", ""],
    credentials: true,
  })
);

//Route middleware
app.use("/api/users", UserRoutes);
app.use("/api/users", PostRoutes);

//Routes
app.get("/", (req, res) => {
  try {
    res.status(200).send("Home-Page");
  } catch (error) {
    console.log(error);
  }
});

//error handler
app.use(errorHandler);

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const startUp = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    res.json(error);
  }
};

startUp();

app.use(notFound);
