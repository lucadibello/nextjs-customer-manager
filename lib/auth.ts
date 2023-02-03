import { generateToken, verifyToken } from './jwt'

import bcrypt from 'bcrypt'
import { ChallengePayload, UserSession } from './types/auth'

export const hashPassword = async (password: string): Promise<string> => {
  if (!process.env.AUTH_PASSWORD_HASH_ROUNDS) {
    throw new Error('AUTH_PASSWORD_HASH_ROUNDS is not set')
  }
  return bcrypt.hash(password, Number(process.env.AUTH_PASSWORD_HASH_ROUNDS))
}

export const generateChallengeToken = (payload: UserSession): string => {
  if (!process.env.JWT_CHALLENGE_TOKEN_SECRET) {
    throw new Error('JWT_CHALLENGE_TOKEN_SECRET is not set')
  }

  if (!process.env.JWT_CHALLENGE_TOKEN_EXPIRATION) {
    throw new Error('JWT_CHALLENGE_TOKEN_EXPIRATION is not set')
  }

  // Generate a random string of 24 characters
  const challenge =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)

  const challengePayload: ChallengePayload = {
    id: payload.id,
    email: payload.email,
    challenge: challenge,
  }

  // Notice: expiration time is  for challenge token
  return generateToken<ChallengePayload>(
    challengePayload,
    process.env.JWT_CHALLENGE_TOKEN_SECRET as string,
    process.env.JWT_CHALLENGE_TOKEN_EXPIRATION
  )
}

export const verifyChallengeToken = (clientToken: string, dbToken: string) => {
  // If environment variable is not set, throw an error
  if (!process.env.JWT_ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not set')
  }

  console.log('clientToken', clientToken)
  console.log('dbToken', dbToken)

  return true
}

export const generateAccessToken = (payload: UserSession): string => {
  // If environment variable is not set, throw an error
  if (!process.env.JWT_ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not set')
  }

  if (!process.env.JWT_ACCESS_TOKEN_EXPIRATION) {
    throw new Error('ACCESS_TOKEN_EXPIRATION is not set')
  }

  return generateToken(
    payload,
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    process.env.JWT_ACCESS_TOKEN_EXPIRATION
  )
}

export const generateRefreshToken = (payload: UserSession): string => {
  // If environment variable is not set, throw an error
  if (!process.env.JWT_REFRESH_TOKEN_SECRET) {
    throw new Error('JWT_REFRESH_TOKEN_SECRET is not set')
  }

  if (!process.env.JWT_REFRESH_TOKEN_EXPIRATION) {
    throw new Error('JWT_REFRESH_TOKEN_EXPIRATION is not set')
  }

  return generateToken(
    payload,
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    process.env.JWT_REFRESH_TOKEN_EXPIRATION
  )
}

export const generateTwoFactorToken = (payload: UserSession): string => {
  // If environment variable is not set, throw an error
  if (!process.env.JWT_TWO_FACTOR_TOKEN_SECRET) {
    throw new Error('JWT_TWO_FACTOR_TOKEN_SECRET is not set')
  }

  if (!process.env.JWT_TWO_FACTOR_TOKEN_EXPIRATION) {
    throw new Error('JWT_TWO_FACTOR_TOKEN_EXPIRATION is not set')
  }

  return generateToken(
    payload,
    process.env.JWT_TWO_FACTOR_TOKEN_SECRET as string,
    process.env.JWT_TWO_FACTOR_TOKEN_EXPIRATION
  )
}

export const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash)
}

export const verifyAccessToken = (token: string) => {
  // If environment variable is not set, throw an error
  if (!process.env.JWT_ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not set')
  }

  return verifyToken(token, process.env.JWT_ACCESS_TOKEN_SECRET)
}

export const verifyTwoFactorToken = (token: string) => {
  // If environment variable is not set, throw an error
  if (!process.env.JWT_TWO_FACTOR_TOKEN_SECRET) {
    throw new Error('JWT_TWO_FACTOR_TOKEN_SECRET is not set')
  }

  return verifyToken(token, process.env.JWT_TWO_FACTOR_TOKEN_SECRET)
}
