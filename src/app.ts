import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { userRoute } from "./modules/user/user.route";
import { profileRoute } from "./modules/profile/profile.route";
import { testRoute } from "./modules/test/test.route";
import { authRouter } from "./modules/auth/auth.route";
import logger from "./middleware/logger";
import cookieParser from "cookie-parser";
import coors from "cors";
import { globalErrorHandler } from "./middleware/globalErrorHandler";

const app: Application = express();

//middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(
  coors({
    origin: "http://localhost:3000",
  }),
);

app.use("/api/users", userRoute);
app.use("/api/profile", profileRoute);
app.use("/api/test", testRoute);
app.use("/api/auth", authRouter);

// get all Api
// get Single User base on id
// update user
// delete single user

// Global Error Handling Middleware
app.use(globalErrorHandler);

export default app;
