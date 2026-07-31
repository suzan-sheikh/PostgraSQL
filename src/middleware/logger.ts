import fs from "fs";
import type { NextFunction, Request, Response } from "express";

const logger = (req: Request, res: Response, next: NextFunction) => {
  console.log("Method - URL - Time:", req.method, req.url, Date.now());

  const log = `\nMethod -> ${req.method} URL -> ${req.url} Time -> ${Date()}\n`;
  fs.appendFile("logger.txt", log, (error) => {});

  next();
};

export default logger;
