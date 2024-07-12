import { sign } from "jsonwebtoken";

export async function generateTokenProvider(userId: string) {
  const token = sign({ }, `${process.env.JTW_SECRET}`, {
    subject: userId,
    expiresIn: "20s"
  })
  return token
}