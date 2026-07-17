import express, {
  type Application,
  type Request,
  type Response,
} from "express";

import { Pool } from "pg";

const app: Application = express();
const port = 5000;

//middleware
app.use(express.json());
app.use(express.text());

//DB Connection
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_JmoL9ENacDf8@ep-young-mode-awjeu1km-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

// Create Table
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(20),
      email VARCHAR(20) UNIQUE NOT NULL,
      password VARCHAR(20) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      age INT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
    console.log("Database Connected Successfully!");
  } catch (error) {
    console.log(error);
  }
};
initDB();

//default get
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express Server",
    author: "Next Level",
  });
});

// post api (insert Data on DB)
app.post("/api/users", async (req: Request, res: Response) => {
  const { name, email, password, age } = req.body;

  // console.log(name, email, password, age);

  try {
    const result = await pool.query(
      `
      INSERT INTO users(name, email, password, age) VALUES($1, $2, $3, $4)
      RETURNING *
      `,
      [name, email, password, age],
    );
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
});

// get all Api
app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
    SELECT * FROM users
    `);
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
});

//get Single User base on id
app.get("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
    SELECT * FROM users WHERE id=$1
      `,
      [id],
    );

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
});

// update user
app.put("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, password, age, is_active } = req.body;
  console.log("id :", id);
  console.log({ name, password, age, is_active });

  try {
    const result = await pool.query(
      `
    UPDATE users 
    SET 
    name=COALESCE($1, name),
    password=COALESCE($2, password),
    age=COALESCE($3, age),
    is_active=COALESCE($4, is_active)
    WHERE id=$5 RETURNING *
    `,
      [name, password, age, is_active, id],
    );

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
      success: true,
      message: error.message,
      data: error,
    });
  }
  // console.log(result);
});

app.listen(port, () => {
  console.log(`Server is Running ${port} 👍`);
});
