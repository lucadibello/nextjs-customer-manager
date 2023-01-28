import type { NextApiRequest, NextApiResponse } from 'next'
import { withMiddlewares } from '../../../middlewares'
import { prisma } from '../../../lib/db'
import * as auth from '../../../lib/auth'
import { StartChallengeApiResponse, UserSession } from '../../../lib/types/auth'
import { logger } from '../../../lib/logger'

const startChallengeRoute = async (
  req: NextApiRequest,
  res: NextApiResponse<StartChallengeApiResponse>
) => {
  // Extract email and password from request body
  const { email, password } = req.body as { email: string; password: string }

  // If email or password is not present, return a 400 response
  if (!email || !password) {
    logger.warn(
      '[/api/challenge/start] Missing email or password body parameter'
    )

    return res.status(400).json({
      success: false,
      message: 'Missing email or password',
    })
  }

  // Check if user exists in database
  const user = await prisma.employee.findUnique({
    where: {
      Email: email,
    },
  })

  // If user does not exist, return a 401 response
  if (!user) {
    logger.warn(`[/api/challenge/start] User ${email} not found`)

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    })
  } else {
    // If user exists, check if password is correct using auth lib
    if (await auth.verifyPassword(password, user.Password)) {
      logger.info(
        `[/api/challenge/start] User ${email} authenticated correctly`
      )

      // Keep only fields defined in SessionUser
      const session: UserSession = {
        id: user.EmployeeId,
        email: user.Email,
        name: user.FirstName,
        surname: user.LastName,
        role: user.Role,
      }

      // Generate a challenge token
      const challengeToken = auth.generateChallengeToken(session)

      // If user haven't used the challenge code (so the record still in the table) update it with the new token
      const challengeEntry = await prisma.authChallenge.findUnique({
        where: {
          EmployeeId: user.EmployeeId,
        },
      })

      if (challengeEntry) {
        logger.info(
          `[/api/challenge/start] User ${email} already used the challenge code, updating token`
        )

        await prisma.authChallenge.update({
          where: {
            EmployeeId: user.EmployeeId,
          },
          data: {
            Token: challengeToken,
          },
        })
      } else {
        logger.info(
          `[/api/challenge/start] User ${email} never used the challenge code, creating new record`
        )

        // If user haven't used the challenge code (so the record still in the table) create a new record
        await prisma.authChallenge.create({
          data: {
            EmployeeId: user.EmployeeId,
            Token: challengeToken,
          },
        })
      }

      // Return a 200 response with the challenge token
      return res.status(200).json({
        success: true,
        data: {
          challenge: challengeToken,
        },
      })
    } else {
      logger.warn(`[/api/challenge/start] User ${email} password is incorrect`)

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }
  }
}

export default withMiddlewares(startChallengeRoute)
