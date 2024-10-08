import dayjs from "dayjs";
import { refreshTokenRepository } from "../models/prismaClient";

export async function GenerateRefreshToken(userId: string) {
  const expiresIn = dayjs().add(1, "day").unix()
  const generateRefreshToken = await refreshTokenRepository.create({
    data: {
      userId,
      expiresIn
    }
  })

  return generateRefreshToken
}

