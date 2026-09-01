import bcrypt from "bcrypt";

const SALT = 12;

export const hashValue = async (value) => {
  return bcrypt.hash(value, SALT);
};

export const compareValue = async (value, hash) => {
  return bcrypt.compare(value, hash);
};