import { NextApiResponse } from 'next'
import { withMiddlewares } from '../../../middlewares'
import {
  authMiddleware,
  NextApiRequestWithUser,
} from '../../../middlewares/auth-middleware'
import { prisma } from '../../../lib/db'
import { CustomersApiResponse } from '../../../lib/types/apis/customers'

export const fetchEmployeeCustomers = async (employeeId: number) => {
  // Fetch all customers from database assigned to the current user
  const customers = await prisma.customer.findMany({
    where: {
      SupportRepId: employeeId,
    },
  })

  // Return customers as JSON
  return {
    success: true,
    data: {
      customers,
    },
  } as CustomersApiResponse
}

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

  // Return customers as JSON
  res.json({
    success: true,
    data: {
      customers,
    },
  })
}

export default withMiddlewares(authMiddleware, customersRoute)
