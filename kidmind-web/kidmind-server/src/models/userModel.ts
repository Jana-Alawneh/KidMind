import db from "../database/db";
import type { ResultSetHeader } from "mysql2";

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
export const updateChild = async (
  id: number,
  fullName: string,
  age: number,
  gender: string,
  parentName: string,
  notes: string | null
) => {
  const [result] = await db.query<ResultSetHeader>(
    `
      UPDATE children
      SET
        full_name = ?,
        age = ?,
        gender = ?,
        parent_name = ?,
        notes = ?
      WHERE id = ?
    `,
    [
      fullName,
      age,
      gender,
      parentName,
      notes,
      id,
    ]
  );

  return result.affectedRows;
};