import { ApiResponse } from '../api'

export type CustomersApiResponse = ApiResponse<{
  customers: Customer[]
}>
