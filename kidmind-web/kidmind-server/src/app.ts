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


// Existing Child AI:
// one child -> strengthening plan -> personalized game.
app.use(
  "/ai",
  aiRoutes
);


// Separate Admin AI:
// aggregated platform statistics -> trends -> recommendations.
app.use(
  "/api/ai",
  adminAiRoutes
);


app.use(
  "/notifications",
  notificationRoutes
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
