import dayjs from "dayjs";
import { refreshTokenRepository } from "../models/prismaClient";
import { createResult } from "../common/result";
import { generateTokenProvider } from "../provider/generateTokenProvider";
import { GenerateRefreshToken } from "../provider/GenerateRefreshToken";

async function refreshTokenUser(refreshTokenId: string) {
  const refreshToken = await refreshTokenRepository.findFirst({
    where: {
      id: refreshTokenId
    }
  })

  if (!refreshToken) {
    return createResult(null, "Refresh Token Invalid")
  }

  const refreshTokenExpired = dayjs().isAfter(dayjs.unix(refreshToken.expiresIn))

  const token = await generateTokenProvider(refreshToken.userId)


  if(refreshTokenExpired) {

    await refreshTokenRepository.deleteMany({
      where: {
        userId: refreshToken.userId
      }
    })

    const newRefreshToken = await GenerateRefreshToken(refreshToken.userId)
    return createResult({token, refreshToken: newRefreshToken}, null)
  }

  return createResult({accessToken: token}, null)
}

export const refreshTokenUserServices = {
  refreshTokenUser
}