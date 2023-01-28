// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { withMiddlewares } from '../../middlewares'
import { prisma } from '../../lib/db'
import * as auth from '../../lib/auth'
import { UserSession } from '../../lib/types/auth'
import { LoginApiResponse } from '../login/login'
import { Role } from '@prisma/client'
import { joiMiddleware } from '../../middlewares/joi-middleware'
import Joi from 'joi'
import { logger } from '../../lib/logger'

// Define JOI schema for request body
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

const loginRoute = async (
  req: NextApiRequest,
  res: NextApiResponse<LoginApiResponse>
) => {
  // Extract email and password from request body
  const { email, password } = req.body as { email: string; password: string }

  logger.info(`[/api/login] Login attempt for ${email}`)

  // Check if user exists in database
  const user = await prisma.employee.findUnique({
    where: {
      Email: email,
    },
  })

  // If user does not exist, return a 401 response
  if (!user) {
    logger.warn(
      `[/api/login] Login attempt for ${email} failed. Invalid email.`
    )

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    })
  } else {
    // If user exists, check if password is correct using auth lib
    if (await auth.verifyPassword(password, user.Password)) {
      // Keep only fields defined in SessionUser
      const session: UserSession = {
        id: user.EmployeeId,
        email: user.Email,
        name: user.FirstName,
        surname: user.LastName,
        role: user.Role,
      }

      // generate access + refresh token
      const token = auth.generateAccessToken(session)

      logger.info(
        `[/api/login] Login attempt for ${email} succeeded. Role: ${session.role}`
      )

      // Generate refresh token only for managers
      if (session.role == Role.MANAGER) {
        const refreshToken = auth.generateRefreshToken(session)

        // save refresh token + second factor auth to database
        await prisma.employee.update({
          where: {
            EmployeeId: user.EmployeeId,
          },
          data: {
            RefreshToken: refreshToken,
          },
        })
        // return access and refresh token
        return res.status(200).json({
          success: true,
          data: {
            token,
            refreshToken,
            session,
          },
        })
      } else {
        // return access and refresh token
        return res.status(200).json({
          success: true,
          data: {
            token,
            session,
          },
        })
      }
    } else {
      logger.warn(
        `[/api/login] Login attempt for ${email} failed. Wrong password.`
      )

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }
  }
}

export default withMiddlewares(joiMiddleware(schema), loginRoute)
