const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv")
dotenv.config();
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

connectDB();

const requestRoutes = require("./routes/requestRoutes");
const authRoutes = require("./routes/authRoutes");
app.use("/api", requestRoutes);
app.use("/api", authRoutes);


const path = require('path');
const authMiddleware = require('./middleware/authMiddleware');

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.use(express.static(path.join(__dirname, '../frontend')));


app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
