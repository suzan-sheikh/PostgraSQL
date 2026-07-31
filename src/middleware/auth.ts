import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const auth = (...roles: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {

    console.log(roles);

    try {
      // console.log("This is protected route");

      const token = req.headers.authorization;

      if (!token) {
        res.status(401).json({
          success: false,
          message: "Unauthorize User",
        });
      }

      const decoded = jwt.verify(
        token as string,
        config.secret as string,        
      ) as JwtPayload;
      // console.log(decoded);

      const userDate = await pool.query(
        `
      SELECT * FROM users WHERE email=$1      
      `,
        [decoded.email],
      );

      const user = userDate.rows[0];

      if (userDate.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: "User Not Found",
        });
      }

      if (!user?.is_active) {
        res.status(402).json({
          success: false,
          message: "Forbidden!!",
        });
      }

      req.user = decoded;
      // console.log("auth File",decoded);

      next();
    } catch (error) {
      next(error)
    }
  };
};

export default auth;
