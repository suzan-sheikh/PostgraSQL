import { pool } from "../../db"; // Database Connection
import bcrypt from "bcrypt"; // Password Compare
import jwt, { type JwtPayload } from "jsonwebtoken"; // JWT Token
import config from "../../config"; // Environment Config

// =========================
// User Login
// =========================
const loginUserIntoDB = async (payLoad: {
  email: string;
  password: string;
}) => {

  // Email ও Password নেওয়া
  const { email, password } = payLoad;

  // Email দিয়ে User খোঁজা
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );

  // User না থাকলে Error
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }

  // User Data
  const user = userData.rows[0];

  // Password মিলিয়ে দেখা
  const matchPassword = await bcrypt.compare(password, user.password);

  // Password ভুল হলে Error
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }

  // Token Payload
  const jwtPayload = {
    id: user.id,
    name: user.name,
    is_active: user.is_active,
    email: user.email,
    role: user.role,
  };

  // Access Token (১ দিন)
  const accessToken = jwt.sign(jwtPayload, config.secret as string, {
    expiresIn: "1d",
  });

  // Refresh Token (১০ দিন)
  const refreshToken = jwt.sign(jwtPayload, config.refresh_secret as string, {
    expiresIn: "10d",
  });

  // Token Return
  return {
    accessToken,
    refreshToken,
  };
};

// =========================
// Refresh Token
// =========================
const generateRefreshToken = async (token: string) => {

  // Token না থাকলে Error
  if (!token) {
    throw new Error("Unauthorize");
  }

  // Refresh Token Verify
  const decoded = jwt.verify(
    token as string,
    config.refresh_secret as string,
  ) as JwtPayload;

  // User খোঁজা
  const userDate = await pool.query(
    `
      SELECT * FROM users WHERE email=$1
    `,
    [decoded.email],
  );

  const user = userDate.rows[0];

  // User না থাকলে Error
  if (userDate.rows.length === 0) {
    throw new Error("User Not Found");
  }

  // User Active কিনা Check
  if (!user?.is_active) {
    throw new Error("Forbidden");
  }

  // নতুন Token Payload
  const jwtPayload = {
    id: user.id,
    name: user.name,
    is_active: user.is_active,
    email: user.email,
    role: user.role,
  };

  // নতুন Access Token তৈরি
  const accessToken = jwt.sign(jwtPayload, config.secret as string, {
    expiresIn: "30d", // সাধারণত 1d রাখা হয়
  });

  // নতুন Access Token Return
  return {
    accessToken,
  };
};

// Export Service
export const authService = {
  loginUserIntoDB,
  generateRefreshToken,
};