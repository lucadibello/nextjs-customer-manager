import { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponse } from '../lib/types/api'
import { UserSession } from '../lib/types/auth'
import { Middleware } from '../lib/types/middleware'
import { ObjectSchema } from 'joi'

export type NextApiRequestWithUser = NextApiRequest & {
  user: UserSession
}

export type JoiMiddleware = Middleware & {
  schema: ObjectSchema<any>
}

// joi-middleware.ts
export const joiMiddleware =
  (schema: ObjectSchema<any>): Middleware =>
  async <T extends ApiResponse<T>>(
    req: NextApiRequestWithUser,
    res: NextApiResponse<T>,
    next?: Middleware
  ) => {
    const { error, value } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: undefined,
      } as T)
    }
    req.body = value
    if (next) {
      return next(req, res)
    }
  }
