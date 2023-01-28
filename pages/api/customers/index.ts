import { NextApiResponse } from 'next'
import { withMiddlewares } from '../../../middlewares'
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '../../../middlewares/auth-middleware'
import { prisma } from '../../../lib/db'
import { CustomersApiResponse } from '../../../lib/types/apis/customers'
import { logger } from '../../../lib/logger'

const customersRoute = async (
  req: NextApiRequestWithUser,
  res: NextApiResponse<CustomersApiResponse>
) => {
  // Fetch all customers from database assigned to the current user
  const customers = await prisma.customer.findMany({
    where: {
      SupportRepId: req.user.id,
    },
  })

  logger.info(`[/api/customers] Returning customers for user ${req.user.email}`)

  // Return customers as JSON
  return res.json({
    success: true,
    data: {
      customers,
    },
  })
}

export default withMiddlewares(authMiddleware, customersRoute)
