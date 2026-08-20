import db from "../database/db";
import type {
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";


export const getAllUsers = async () => {

  const [rows] =
    await db.query(
      "SELECT * FROM children"
    );

  return rows;

};


export const getChildById = async (
  id: number
) => {

  const [rows] =
    await db.query<RowDataPacket[]>(
      `
      SELECT *
      FROM children
      WHERE id = ?
      `,
      [id]
    );

  return rows[0] ?? null;

};


export const addChild = async (
  full_name: string,
  age: number,
  gender: string,
  parent_name: string,
  region: string,
  notes: string
) => {

  const [result] =
    await db.query<ResultSetHeader>(
      `
      INSERT INTO children
      (
        full_name,
        age,
        gender,
        parent_name,
        region,
        notes
      )
      VALUES
      (?, ?, ?, ?, ?, ?)
      `,
      [
        full_name,
        age,
        gender,
        parent_name,
        region,
        notes,
      ]
    );

  return result;

};


export const deleteChild = async (
  id: number
) => {

  const [result] =
    await db.query(
      `
      DELETE FROM children
      WHERE id = ?
      `,
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
  region: string | null,
  notes: string | null
) => {

  const [result] =
    await db.query<ResultSetHeader>(
      `
      UPDATE children
      SET
        full_name = ?,
        age = ?,
        gender = ?,
        parent_name = ?,
        region = ?,
        notes = ?
      WHERE id = ?
      `,
      [
        fullName,
        age,
        gender,
        parentName,
        region,
        notes,
        id,
      ]
    );

  return result.affectedRows;

};