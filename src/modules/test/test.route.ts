import { Router } from "express";
import { testController } from "./test.controller";

const router = Router();

router.get("/", testController.createTest);

export const testRoute = router;
