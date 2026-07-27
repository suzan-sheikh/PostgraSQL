import { pool } from "../../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config";

const loginUserIntoDB = async (payLoad: {
  email: string;
  password: string;
}) => {
  const { email, password } = payLoad;

  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }
  const user = userData.rows[0];
  console.log(user);

  const matchPassword = await bcrypt.compare(password, user.password);
  console.log(matchPassword);

  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    is_active: user.is_active,
    email: user.email,
  };
  const accessToken = jwt.sign(jwtPayload, config.secret as string, {
    expiresIn: "1d",
  });

  return {accessToken};

  //   console.log(user);
  // 1 check if the user exists -> done
  // 2 compare the password -> done
  // 3 generate Token ->
};

export const authService = {
  loginUserIntoDB,
};
