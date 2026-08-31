import express from "express";
import cors from "cors";

import chatRoutes from "./routes/chatRoutes";
import childrenRoutes from "./routes/childrenRoutes";
import gameBuilderRoutes from "./routes/gameBuilderRoutes";
import aiRoutes from "./routes/aiRoutes";
import adminAiRoutes from "./routes/adminAiRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import sessionsRoutes from "./routes/sessionsRoutes";
import userRoutes from "./routes/userRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";


const app =
  express();


app.use(
  cors()
);


app.use(
  express.json({
    limit:
      "10mb",
  })
);


app.get(
  "/",
  (
    req,
    res
  ) => {

    res.send(
      "KidMind API is running"
    );

  }
);


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
  "/ai",
  aiRoutes
);

app.use(
  "/api/ai",
  adminAiRoutes
);


app.use(
  "/notifications",
  notificationRoutes
);


app.use(
  "/feedback",
  feedbackRoutes
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