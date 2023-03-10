// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiResponse } from 'next'
import { withMiddlewares } from '../../middlewares'
import { prisma } from '../../lib/db'
import * as auth from '../../lib/auth'
import { LoginApiResponse } from '../login/login'
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '../../middlewares/auth-middleware'
import Joi from 'joi'
import { joiMiddleware } from '../../middlewares/joi-middleware'
import { logger } from '../../lib/logger'

// Define JOI schema for request body
const schema = Joi.object({
  password: Joi.string().required(),
  otp: Joi.string().required(),
})

const changePasswordRoute = async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<LoginApiResponse>
) => {
  // Extract email and password from request body
  const { password, otp } = req.body as { password: string; otp: string }

  // If email or password is not present, return a 400 response
  if (!password) {
    logger.warn('[/api/change-password] Missing new password body parameter')

    return res.status(400).json({
      success: false,
      message: 'Missing new password',
    })
  } else if (!otp) {
    logger.warn('[/api/change-password] Missing OTP code body parameter')

    return res.status(400).json({
      success: false,
      message: 'Missing OTP code',
    })
  }

  // Fetch user token from database
  const authChallenge = await prisma.authChallenge.findFirst({
    where: {
      EmployeeId: req.user.id,
    },
  })

  if (!authChallenge) {
    logger.warn(
      `[/api/change-password] User ${req.user.id} has not started the challenge`
    )

    return res.status(401).json({
      success: false,
      message: 'You have not started the challenge',
    })
  }
  // Verify OTP code
  if (!auth.verifyChallengeToken(authChallenge.Token, otp)) {
    logger.warn(
      `[/api/change-password] Invalid OTP code for user ${req.user.id}`
    )

    return res.status(401).json({
      success: false,
      message: 'Invalid OTP code',
    })
  }

  // Fetch employee's password from database
  const employee = await prisma.employee.findFirst({
    where: {
      EmployeeId: req.user.id,
    },
    select: {
      Password: true,
    },
  })

  if (employee) {
    logger.info(
      `[/api/change-password] Changing password for user ${req.user.id}`
    )

    // Now, verify that the new password is not the same as the old password
    if (await auth.verifyPassword(password, employee.Password)) {
      logger.warn(
        `[/api/change-password] New password is the same as the old password for user ${req.user.id}`
      )

      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as the old password',
      })
    }
  } else {
    logger.warn(
      `[/api/change-password] Employee ${req.user.id} not found in database`
    )

    return res.status(400).json({
      success: false,
      message: 'Employee not found',
    })
  }

  // Hash password
  const hashedPassword = await auth.hashPassword(password)

  logger.info(
    `[/api/change-password] Updating password for user ${req.user.id}`
  )

  // Update user password
  await prisma.employee.update({
    where: {
      EmployeeId: req.user.id,
    },
    data: {
      Password: hashedPassword,
    },
  })

  // Delete auth challenge
  await prisma.authChallenge.delete({
    where: {
      EmployeeId: req.user.id,
    },
  })

  logger.info(
    `[/api/change-password] Challenge deleted for user ${req.user.id}`
  )

  // Now that the password is changed, return a 200 response
  return res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  })
}

export default withMiddlewares(
  authMiddleware,
  joiMiddleware(schema),
  changePasswordRoute
)
