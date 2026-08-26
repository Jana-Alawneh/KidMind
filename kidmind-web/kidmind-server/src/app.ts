import express from "express";

import cors from "cors";

import chatRoutes from "./routes/chatRoutes";

import childrenRoutes from "./routes/childrenRoutes";

import gameBuilderRoutes from "./routes/gameBuilderRoutes";

import sessionsRoutes from "./routes/sessionsRoutes";

import userRoutes from "./routes/userRoutes";


const app = express();


app.use(cors());

app.use(
  express.json({
    limit: "10mb",
  })
);


app.get("/", (req, res) => {

  res.send(

    "KidMind API is running"

  );

});


app.use(

  "/chat",

  chatRoutes

);


app.use(

  "/children",

  childrenRoutes

);


app.use(

  "/game-builder",

  gameBuilderRoutes

);


app.use(

  "/sessions",

  sessionsRoutes

);


app.use(

  "/users",

  userRoutes

);


export default app;