import {
  Box,
  Heading,
  useToast,
  Text,
  HStack,
  IconButton,
  Checkbox,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverHeader,
  Divider,
  Badge,
  Tooltip,
} from '@chakra-ui/react'
import { Customer } from '@prisma/client'
import { AnimatePresence, motion } from 'framer-motion'
import { GetServerSidePropsContext, InferGetServerSidePropsType, NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FiFilter, FiRefreshCw } from 'react-icons/fi'
import useSWR, { SWRConfig, SWRResponse } from 'swr'
import CustomerQueryBuilder from '../components/CustomerQueryBuilder'
import CustomerTable, { CustomerTableAvailableColumns, defaultColumns } from '../components/CustomerTable'
import Navbar from '../components/Navbar'
import NavbarProfile from '../components/NavbarProfile'
import { CustomersApiResponse } from '../lib/types/apis/customers'
import { useAuth } from '../providers/auth/AuthProvider'
import { swrFetcher } from '../util/fetcher'

import withAuth from '../util/withAuth'

const allPossibleColumns: CustomerTableAvailableColumns = [
  'CustomerId',
  'FirstName',
  'LastName',
  'Company',
  'Address',
  'City',
  'State',
  'Country',
  'PostalCode',
  'Phone',
  'Fax',
  'Email',
]

export const getServerSideProps = (context: GetServerSidePropsContext) => withAuth(context, async (token) => {
  // Fetch posts from APIs
  const url = new URL('/api/customers', process.env.APP_URL)

  // Build API URL
  const result = await fetch(url, {
    headers: {
      cookie: `token=${token}`,
    }
  })

  // Check if response is not ok
  if (!result.ok) {
    return {
      props: {
        fallback: {
          '/api/customers': {
            success: false,
            data: {
              customers: [],
            }
          }
        },
      },
    }
  } else {
    // Parse response
    const response: CustomersApiResponse = await result.json()
    return {
      props: {
        fallback: {
          '/api/customers': {
            success: true,
            data: {
              customers: response.data && response.data.customers ? response.data.customers : [],
            }
          },
        },
      },
    }
  }
}, {
  redirectTo: '/',
  twoFactorEnabled: false,
})


const SWRCustomerTable = ({ customers, columns }: { customers: SWRResponse<CustomersApiResponse>, columns: CustomerTableAvailableColumns }) => {
  if (customers.error) {
    return (
      <Box>
        <Text color="red">An error occurred while fetching customers.</Text>
      </Box>
    )
  } else if (!customers.data) {
    return (
      <Box>
        <Text>Loading...</Text>
      </Box>
    )
  } else {
    return (
      <CustomerTable customers={customers.data.data?.customers || []} columns={columns} />
    )
  }
}

const HomePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ fallback }) => {
  const [showFilter, setShowFilter] = useState(false)
  const [columns, setColumns] = useState<CustomerTableAvailableColumns>(defaultColumns)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [filtersEnabled, setFiltersEnabled] = useState(false)

  // Load providers
  const { currentUser, logOut } = useAuth()
  const router = useRouter()
  const toast = useToast()

  // Fetch customers from APIs
  const swrCustomers = useSWR<CustomersApiResponse>(
    '/api/customers',
    (url) => swrFetcher(url, () => {
      // Show toast      
      toast({
        title: 'Error',
        description: 'Your session has expired. Please log in again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })

      // Logout user and redirect to login page
      logOut()
      router.push('/login')
    })
  )

  // Persist user columns settings
  useEffect(() => {
    // Load columns from local storage
    const columns = localStorage.getItem('columns')
    if (columns) {
      setColumns(JSON.parse(columns))
    }
  }, [])

  return (
    <SWRConfig value={{ fallback }}>
      <Navbar
        homeURL="/"
        rightComponent={
          currentUser && [
            <NavbarProfile
              currentUser={currentUser}
              onLogOut={() => {
                // log out
                logOut()
                // redirect to home page
                router.push('/')
              }}
              key="avatar"
            />,
          ]
        }
      />
      <Box marginTop={'60px'} p={6}>
        <HStack>
          <Heading>
            View customers
          </Heading>
          <Box>
            <Popover
              isOpen={showFilter}
              onClose={() => {
                // Close popover
                setShowFilter(false)

                // Persist columns to local storage
                localStorage.setItem('columns', JSON.stringify(columns))
              }}
              placement="right-end"
              closeOnBlur={true}
            >
              <PopoverTrigger>
                <IconButton
                  icon={<FiFilter />}
                  aria-label="Settings"
                  variant="ghost"
                  onClick={() => setShowFilter(!showFilter)}
                />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />

                <PopoverHeader>Columns</PopoverHeader>

                <PopoverBody>
                  {/* List of checkboxes for each column */}
                  {allPossibleColumns.map((column) => (
                    <Box key={column}>
                      <Checkbox
                        isChecked={columns.includes(column)}
                        disabled={columns.length === 1 && columns.includes(column)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // Insert column at right position
                            const index = allPossibleColumns.indexOf(column)
                            const newColumns = [...columns]
                            newColumns.splice(index, 0, column)
                            setColumns(newColumns)
                          } else {
                            setColumns(columns.filter((c) => c !== column))
                          }
                        }}
                      >
                        {column}
                      </Checkbox>
                    </Box>
                  ))}
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </Box>
        </HStack>


        <Box>
          {swrCustomers.data && swrCustomers.data.data && swrCustomers.data.data.customers && (
            <HStack>
              <Badge color={"green"}>Loaded: {swrCustomers.data.data.customers.length} rows</Badge>
              <Tooltip label="Refresh customer data">
                <IconButton
                  icon={<FiRefreshCw />}
                  aria-label="Refresh"
                  size={"xs"}
                  variant={"ghost"}
                  isLoading={swrCustomers.isValidating}
                  onClick={() => {
                    swrCustomers.mutate()
                  }}
                />
              </Tooltip>
            </HStack>
          )}

          {swrCustomers.error && (
            <Badge color={"red"}>Error: {swrCustomers.error.message}</Badge>
          )}
        </Box>

        <Divider borderBottomColor={"black"} marginTop={2} marginBottom={"20px"} />

        { /* Additional settings */}
        <Box marginTop={"20px"} marginBottom={10}>
          <HStack>
            <Heading size={"md"}>Modular filters</Heading>

            {/* Toggle filters */}
            <Checkbox
              isChecked={showAdvancedFilters}
              onChange={(e) => {

                // If filters are enabled, reset filters
                if (e.target.checked === false) {
                  setShowAdvancedFilters(false)
                } else {
                  setShowAdvancedFilters(true)
                }
                setFiltersEnabled(false)
              }}
            >
              Enable filters
            </Checkbox>
          </HStack>


          <AnimatePresence>
            {showAdvancedFilters && (
              <Box
                as={motion.div}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Box>
                  <Text>Build your own query using this dynamic query builder.</Text>

                  <Box p={4}>
                    <CustomerQueryBuilder
                      queryFields={allPossibleColumns}
                      onQueryGenerated={(dataFilters) => {
                        if (dataFilters.length > 0 && swrCustomers.data && swrCustomers.data.data && swrCustomers.data.data.customers) {
                          // Filter customers (valid if all dataFilters are true for a customer)

                          // Enable filters if disabled
                          !filtersEnabled && setFiltersEnabled(true)

                          const filteredCustomers = swrCustomers.data.data.customers.filter((customer) => {
                            console.log(customer, dataFilters.every((dataFilter) => dataFilter(customer)))
                            return dataFilters.every((dataFilter) => dataFilter(customer))
                          })
                          // Set filtered customers
                          setFilteredCustomers(filteredCustomers)
                        } else {
                          setFiltersEnabled(false)
                          setFilteredCustomers([])
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            )}
          </AnimatePresence>
        </Box>

        {/* Actual data table */}
        <SWRCustomerTable customers={showAdvancedFilters && filtersEnabled ? {
          error: undefined,
          data: {
            success: true,
            data: {
              customers: filteredCustomers
            },
            message: undefined
          },
          isValidating: false,
          mutate: swrCustomers.mutate,
        } : swrCustomers} columns={columns} />
      </Box>
    </SWRConfig >
  )
}
export default HomePage
