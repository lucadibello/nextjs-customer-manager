import { Box } from "@chakra-ui/react"
import { createColumnHelper, DeepKeys } from '@tanstack/react-table'
import { Customer } from "@prisma/client"
import { DataTable } from "./DataTable"

export type CustomerTableAvailableColumns = Array<keyof Customer>
interface ICustomerTableProps {
  customers: Customer[]
  columns: CustomerTableAvailableColumns
}

const columnHelper = createColumnHelper<Customer>();

export const defaultColumns: DeepKeys<Customer>[] = [
  'CustomerId',
  'FirstName',
  'LastName',
  'Company',
  'Country',
  'City',
  'Phone',
  'Address',
  'Email',
]

const generateColumns = (columns: DeepKeys<Customer>[]) => {
  return columns.map(column => {
    return columnHelper.accessor(column, {
      cell: (row) => row.getValue(),
    })
  })
}

const CustomerTable = ({ customers, columns }: ICustomerTableProps) => {
  return (
    <Box>
      <DataTable
        data={customers}
        columns={generateColumns(columns)}
      />
    </Box>
  )
}

export default CustomerTable