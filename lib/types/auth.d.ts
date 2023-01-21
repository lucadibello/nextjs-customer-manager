import { Role } from '@prisma/client'
import { ApiResponse } from './api'

type User = {
  id: number
  name: string
  surname: string
  email: string
  password: string
  role: Role
  refreshToken: string
}

export type StartChallengeApiResponse = ApiResponse<{
  challenge: string
}>

export type ChangePasswordApiResponse = ApiResponse

export type UserSession = Omit<User, 'password' | 'refreshToken'>
