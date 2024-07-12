import { createResult } from "@common/result";
import { refreshTokenRepository } from "@models/prismaClient";
import { GenerateRefreshToken } from "@provider/GenerateRefreshToken";
import { generateTokenProvider } from "@provider/generateTokenProvider";


async function createToken(userId: string) {

  const token = await generateTokenProvider(userId);

  await refreshTokenRepository.deleteMany({
    where: {
      userId: userId
    }
  })

  const refreshToken = await GenerateRefreshToken(userId)

  if (!token) {
    return createResult(null, "Erro ao gerar token")
  }

  return createResult({ token, refreshToken }, null)
}

export const authServices = {
  createToken
}