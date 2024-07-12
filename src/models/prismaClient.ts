import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const userRepository = prisma.user
export const refreshTokenRepository = prisma.refreshToken
export const eventRepository = prisma.event
export const eventInvitationRepository = prisma.eventInvitation