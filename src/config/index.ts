import dotenv from "dotenv";
import path from "path";

// .env ফাইল লোড করা
dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

// Project-এর সব Config এক জায়গায় রাখা
const config = {
  // Database Connection String
  connection_string: process.env.DB_URL as string,

  // Server Port
  port: process.env.PORT,

  // Access Token Secret Key
  secret: process.env.JWT_SECRET,

  // Refresh Token Secret Key
  refresh_secret: process.env.REFRESH_SECRET,
};

// অন্যান্য ফাইলে ব্যবহার করার জন্য Export
export default config;
