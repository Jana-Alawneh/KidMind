import express from "express";
import cors from "cors";

import childrenRoutes from "./routes/childrenRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("KidMind API is running");
});

app.use("/children", childrenRoutes);

export default app;