import { Role } from "@prisma/client"

type User = {
  id: number
  name: string
  surname: string
  email: string
  password: string
  role: Role
  refreshToken: string
}

export type UserSession = Omit<User, 'password' | 'refreshToken'>
