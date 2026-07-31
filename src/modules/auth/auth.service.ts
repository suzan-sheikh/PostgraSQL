import { pool } from "../../db"; // PostgreSQL Database Connection
import bcrypt from "bcrypt"; // Password Hash Compare করার জন্য
import jwt, { type JwtPayload } from "jsonwebtoken"; // JWT Token Create & Verify করার জন্য
import config from "../../config"; // Secret Key (.env) থেকে নেওয়া হচ্ছে

// =====================================================
// User Login
// =====================================================
const loginUserIntoDB = async (payLoad: {
  email: string;
  password: string;
}) => {
  // =====================================================
  // Step-1: Frontend থেকে Email এবং Password নেওয়া
  // =====================================================
  const { email, password } = payLoad;

  // =====================================================
  // Step-2: Email দিয়ে Database থেকে User খোঁজা
  // =====================================================
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );

  // =====================================================
  // Step-3: User না থাকলে Login বন্ধ
  // =====================================================
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials!");
  }

  // Database থেকে পাওয়া User Object
  const user = userData.rows[0];

  console.log(user);

  // =====================================================
  // Step-4: User-এর দেওয়া Password এবং Database-এর
  // Hash Password Compare করা
  // =====================================================
  const matchPassword = await bcrypt.compare(password, user.password);

  console.log(matchPassword);

  // =====================================================
  // Step-5: Password ভুল হলে Login বন্ধ
  // =====================================================
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }

  // =====================================================
  // Step-6: Token-এর ভিতরে যে তথ্য থাকবে
  // (Sensitive Information রাখা উচিত নয়)
  // =====================================================
  const jwtPayload = {
    id: user.id,
    name: user.name,
    is_active: user.is_active,
    email: user.email,
    role: user.role,
  };

  // =====================================================
  // Step-7: Access Token তৈরি
  // এই Token প্রতিটি Protected API Call-এ ব্যবহার হবে
  // Expire: ১ দিন
  // =====================================================
  const accessToken = jwt.sign(jwtPayload, config.secret as string, {
    expiresIn: "1d",
  });

  // =====================================================
  // Step-8: Refresh Token তৈরি
  // Access Token Expire হলে
  // এই Token ব্যবহার করে নতুন Access Token নেওয়া যাবে
  // Expire: ১০ দিন
  // =====================================================
  const refreshToken = jwt.sign(jwtPayload, config.refresh_secret as string, {
    expiresIn: "10d",
  });

  // =====================================================
  // Step-9: Frontend-এ দুইটি Token পাঠানো হচ্ছে
  // =====================================================
  return {
    accessToken,
    refreshToken,
  };
};

// =====================================================
// Refresh Token ব্যবহার করে নতুন Access Token তৈরি
// =====================================================
const generateRefreshToken = async (token: string) => {
  // =====================================================
  // Step-1: Refresh Token এসেছে কিনা Check
  // =====================================================
  if (!token) {
    throw new Error("Unauthorize");
  }

  // =====================================================
  // Step-2: Refresh Token Verify করা
  //
  // এখানে Check হবে:
  // ✔ Token আসল কিনা
  // ✔ Secret Key সঠিক কিনা
  // ✔ Token Expire হয়েছে কিনা
  //
  // Verify সফল হলে Token-এর Payload পাওয়া যাবে
  // =====================================================
  const decoded = jwt.verify(
    token as string,
    config.refresh_secret as string,
  ) as JwtPayload;

  // =====================================================
  // Step-3: Token থেকে পাওয়া Email দিয়ে
  // Database থেকে User বের করা
  //
  // কারণ Token Valid হলেও User Delete বা Block
  // হয়ে যেতে পারে।
  // =====================================================
  const userDate = await pool.query(
    `
      SELECT * FROM users
      WHERE email=$1
    `,
    [decoded.email],
  );

  // Database থেকে পাওয়া User
  const user = userDate.rows[0];

  // =====================================================
  // Step-4: User Database-এ না থাকলে Error
  // =====================================================
  if (userDate.rows.length === 0) {
    throw new Error("User Not Found");
  }

  // =====================================================
  // Step-5: User Active কিনা Check
  //
  // Admin যদি User Block করে দেয়
  // তাহলে নতুন Access Token দেওয়া হবে না
  // =====================================================
  if (!user?.is_active) {
    throw new Error("Forbidden");
  }

  // =====================================================
  // Step-6: নতুন Access Token-এর জন্য Payload তৈরি
  // =====================================================
  const jwtPayload = {
    id: user.id,
    name: user.name,
    is_active: user.is_active,
    email: user.email,
    role: user.role,
  };

  // =====================================================
  // Step-7: ⭐ নতুন Access Token তৈরি হচ্ছে
  //
  // Login করার সময় যে Access Token Expire হয়ে গেছে,
  // Refresh Token Verify হওয়ার পরে Server
  // আবার jwt.sign() ব্যবহার করে
  // সম্পূর্ণ নতুন Access Token তৈরি করছে।
  // =====================================================
  const accessToken = jwt.sign(jwtPayload, config.secret as string, {
    expiresIn: "30d", // সাধারণত এখানে "1d" বা "15m" রাখা হয়
  });

  // =====================================================
  // Step-8: নতুন Access Token Frontend-এ পাঠানো হচ্ছে
  //
  // Frontend পুরনো Access Token Delete করে
  // এই নতুন Access Token Save করবে।
  // =====================================================
  return {
    accessToken,
  };
};

// =====================================================
// Export Services
// =====================================================
export const authService = {
  loginUserIntoDB,
  generateRefreshToken,
};
