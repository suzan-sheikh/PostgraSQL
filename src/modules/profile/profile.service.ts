import { pool } from "../../db";

const createProfileIntoDB = async (payLoad: any) => {
  // console.log(payLoad);
  const { user_id, bio, address, phone, gender } = payLoad;
  const user = await pool.query(
    `
        SELECT * FROM users WHERE id=$1        
        `,
    [user_id],
  );

  if(user.rows.length === 0){
    throw new Error("User not exists")
  }



  console.log(user);
};

export const profileService = {
  createProfileIntoDB,
};
