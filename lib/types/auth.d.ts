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

interface ChallengePayload {
  id: number
  email: string
  challenge: string
}

export type StartChallengeApiResponse = ApiResponse<{
  challenge: string
}>

export type ChangePasswordApiResponse = ApiResponse<undefined>

export type UserSession = Omit<User, 'password' | 'refreshToken'>
