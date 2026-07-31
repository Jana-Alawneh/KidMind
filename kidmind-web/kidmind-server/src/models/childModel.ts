import db from "../database/db";

export const getAllUsers = async () => {
  const [rows] = await db.query("SELECT * FROM children");
  return rows;
};

export const addChild = async (
  full_name: string,
  age: number,
  gender: string,
  parent_name: string,
  notes: string
) => {

  const [result] = await db.query(

    `
    INSERT INTO children
    (
      full_name,
      age,
      gender,
      parent_name,
      notes
    )
    VALUES
    (?, ?, ?, ?, ?)
    `,

    [
      full_name,
      age,
      gender,
      parent_name,
      notes,
    ]

  );

  return result;
};
export const deleteChild = async (id: number) => {

  const [result] = await db.query(
    "DELETE FROM children WHERE id = ?",
    [id]
  );

  return result;

};