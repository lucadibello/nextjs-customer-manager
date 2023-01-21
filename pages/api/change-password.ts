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

const changePasswordRoute = async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<LoginApiResponse>
) => {
  // Extract email and password from request body
  const { password, otp } = req.body as { password: string; otp: string }

  // If email or password is not present, return a 400 response
  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Missing new password',
    })
  } else if (!otp) {
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
    return res.status(401).json({
      success: false,
      message: 'You have not started the challenge',
    })
  }
  // Verify OTP code
  if (!auth.verifyChallengeToken(authChallenge.Token, otp)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid OTP code',
    })
  }

  // Hash password
  const hashedPassword = await auth.hashPassword(password)

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

  // Now that the password is changed, return a 200 response
  return res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  })
}

export default withMiddlewares(authMiddleware, changePasswordRoute)
