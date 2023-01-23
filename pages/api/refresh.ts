import { NextApiResponse } from 'next'
import { verifyToken } from '../../lib/jwt'
import { prisma } from '../../lib/db'
import { withMiddlewares } from '../../middlewares'
import { NextApiRequestWithUser } from '../../middlewares/auth-middleware'
import { generateAccessToken } from '../../lib/auth'
import { ApiResponse } from '../../lib/types/api'
import { UserSession } from '../../lib/types/auth'
import Joi from 'joi'
import { joiMiddleware } from '../../middlewares/joi-middleware'

export type RefreshApiResponse = ApiResponse<{
  token: string
}>

// Define JOI schema for request body
const schema = Joi.object({
  refreshToken: Joi.string().required(),
})

const refreshRoute = async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<RefreshApiResponse>
) => {
  // Read refresh token from body
  const { refreshToken } = req.body

  // If refresh token is not present, return a 400 response
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Missing refresh token',
    })
  }

  // Ok, decode JWT to get user infos
  try {
    const decoded = await verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET as string
    )

    // Check if refresh token is valid
    if (decoded) {
      const user = await prisma.employee.findFirst({
        where: {
          EmployeeId: decoded.id,
          Email: decoded.email,
        },
      })

      // If user does not exist, return a 401 response
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        })
      } else if (user.RefreshToken != refreshToken) {
        // If refresh token does not match, return a 401 response
        return res.status(401).json({
          success: false,
          message: 'Refresh token mismatch',
        })
      } else {
        const session: UserSession = {
          id: user.EmployeeId,
          email: user.Email,
          role: user.Role,
          name: user.FirstName,
          surname: user.LastName,
        }

        // If user exists, generate new access token
        const token = generateAccessToken(session)

        // return new access token
        return res.status(200).json({
          success: true,
          data: {
            token,
          },
        })
      }
    } else {
      // Trigger error manually
      throw new Error('Invalid refresh token')
    }
  } catch (e) {
    // If they don't match, return a 401 response
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    })
  }
}

export default withMiddlewares(joiMiddleware(schema), refreshRoute)
