import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import resultRouter from "./routes/resultRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

//MIDDLEWARE
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://qbit-coding-quiz-webb-app.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ entended: true }));

//DATABASE
connectDB();

//ROUTES
app.use("/api/auth", userRouter);
app.use("/api/results", resultRouter);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
