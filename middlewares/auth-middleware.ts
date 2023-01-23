import { TokenExpiredError } from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../lib/jwt'
import { ApiResponse } from '../lib/types/api'
import { UserSession } from '../lib/types/auth'
import { Middleware } from '../lib/types/middleware'
import { prisma } from '../lib/db'
import { hasCookie, getCookie } from 'cookies-next'

export type NextApiRequestWithUser = NextApiRequest & {
  user: UserSession
}

// middleware.ts
export const authMiddleware: Middleware = async <T extends ApiResponse<T>>(
  req: NextApiRequestWithUser,
  res: NextApiResponse<T>,
  next?: Middleware
) => {
  // look for access token inside cookies
  // Read cookie
  const token = getCookie('token', { req, res })

  // Check if token exists
  if (!hasCookie('token', { req, res }) || !token) {
    return res.status(401).json({
      success: false,
      message: 'Missing token',
    } as T)
  }

  // Check if access token is valid
  let decoded
  try {
    // Verify token
    decoded = await verifyToken(
      token.toString(),
      process.env.JWT_ACCESS_TOKEN_SECRET as string
    )
  } catch (error) {
    // If token is just expired, try to refresh it
    if (error instanceof TokenExpiredError) {
      // answer with special error code
      return res.status(498).json({
        success: false,
        message: 'Token expired',
      } as T)
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    } as T)
  }

  // Ensure that a user has done 2 factor authentication (is twoFactorToken is NULL)
  const user = await prisma.employee.findUnique({
    where: {
      EmployeeId: decoded.id,
    },
  })

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    } as T)
  }

  // Add user to request
  req.user = decoded

  // and call next()
  if (next) await next(req, res, undefined)

  // Else, return
  return res.status(200)
}
