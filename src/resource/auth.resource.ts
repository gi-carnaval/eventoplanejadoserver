export interface authenticateUserBody {
  access_token: string
}

export interface IUser {
  id: string;
  googleId: string;
  name: string;
  email: string;
  picture: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface createUser {
  id: string,
  email: string,
  name: string,
  picture: string
}