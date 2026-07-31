import type { Request, Response } from "express";
import { userService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
    
  try {
    const result = await userService.createUserIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User Create Successful",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  console.log('get all Controller', req.user);
  try {
    const result = await userService.getAllUsersFromBD();
    res.status(200).json({
      success: true,
      message: "user retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await userService.getUserFromDB(id as string);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User Not Found",
        data: {},
      });
    }
    res.status(200).json({
      success: true,
      message: "single user retrieved successfully",
      data: result.rows[0],
    });
    console.log(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.updateUserFromDB(req.body, id as string);
  try {
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User Id Not Found",
      });
    }
    res.status(200).json({
      success: true,
      message: "User Update Successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error,
    });
  }
  // console.log(result);
};

const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await userService.deleteUserFromDB(id as string);
  try {
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User Not Found",
        data: {},
      });
    }
    res.status(200).json({
      success: true,
      message: "User Deleted Successful",
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: error,
    });
  }
};

export const userController = {
  createUser,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
};
