import express from "express";
import cors from "cors";

import childrenRoutes from "./routes/childrenRoutes";
import sessionsRoutes from "./routes/sessionsRoutes";


const app = express();


app.use(cors());

app.use(express.json());


app.get("/", (req, res) => {

  res.send(
    "KidMind API is running"
  );

});


app.use(
  "/children",
  childrenRoutes
);


app.use(
  "/sessions",
  sessionsRoutes
);


export default app;