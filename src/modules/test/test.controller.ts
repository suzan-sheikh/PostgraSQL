import type { Request, Response } from "express";
import { testService } from "./test.service";

const createTest = async (req: Request, res: Response) => {
  try {
    const result = await testService.createTestFormDB(req.body);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error,
    });
  }
};

export const testController = {
  createTest,
};
