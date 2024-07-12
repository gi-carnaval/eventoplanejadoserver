import { createResult } from "../common/result"
import { userRepository } from "../models/prismaClient"
import { createUser, IUser } from "../resource/auth.resource"


async function getUserByEmail(email: string){
  const user = await userRepository.findFirst({
    where: {
      email
    }
  })

  if(!user) {
    return createResult(null, "User não encontrado")
  }

  return createResult(user, null)
}

async function getUserByUserId(userId: string){
  const user = await userRepository.findFirst({
    where: {
      id: userId
    }
  })

  if(!user) {
    return createResult(null, "User não encontrado")
  }

  return createResult(user, null)
}

async function createUser(user: createUser) {
  const newUser = await userRepository.create({
    data: {
      email: user.email,
      googleId: user.id,
      name: user.name,
      picture: user.picture
    }
  })

  return createResult(newUser, null);
}

async function getUser(user: IUser){

  const userAlreadyExists = await getUserByEmail(user.email)

  if (userAlreadyExists.isError()) {
    const newUser = await userServices.createUser(user)

    if (newUser.isError()) {
      console.error(`Erro ao salvar o usuário. ${newUser.error}`)
      return newUser.error
    }
    return newUser
  }
  return userAlreadyExists
}

export const userServices = {
  getUserByEmail,
  getUserByUserId,
  createUser,
  getUser
}