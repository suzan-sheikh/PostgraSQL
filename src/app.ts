import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { initDB, pool } from "./db";
import { userRoute } from "./modules/user/user.route";

const app: Application = express();

//middleware
app.use(express.json());
app.use(express.text());


//default get
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express Server",
    author: "Next Level",
  });
});

app.use('/api/users', userRoute);






// get all Api

//get Single User base on id


// update user


//delete single user


export default app;