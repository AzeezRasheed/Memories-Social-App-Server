import mongoose from "mongoose";

export const connectDB = (url) => {
  mongoose
    .connect(url, { useNewUrlParser: true })
    .then(() => {
      console.log("connected to database");
    })
    .catch((error) => {
      console.log(error);
    });
};
