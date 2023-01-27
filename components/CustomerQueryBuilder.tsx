import { useEffect, useMemo, useState } from "react"
import {
  Box,
  chakra,
  Flex,
  FormControl,
  HStack,
  IconButton,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  usePopoverContext,
  VStack
} from "@chakra-ui/react"
import { Customer } from "@prisma/client"
import { FiPlus } from "react-icons/fi"

type QueryField = {
  name: keyof Customer
  color: string
  queryOperations: QueryOperation[]
}

type QueryFields = QueryField[]

type QueryKind = "equals" |
  "not equals" |
  "contains" |
  "not contains" |
  "starts with" |
  "ends with" |
  "is empty" |
  "is not empty"


type InputQueryKind = {
  kind: QueryKind
  requiresInput: boolean
  supportsComplexQueries: boolean
}

export type FilterLambda = (_customer: Customer) => boolean


interface CustomerQueryBuilderProps {
  queryFields: (keyof Customer)[]
  onQueryGenerated: (_filters: FilterLambda[]) => void
}

interface QueryElementProps {
  backgroundColor: string
  text: string
}

type QueryOperation = {
  kind: InputQueryKind,
  value: string,
  nextConnector?: "and" | "or"
}

interface FieldQueryBuilderProps {
  field: QueryField
  possibleOperations: InputQueryKind[]
  onQueryUpdate: (_query: QueryOperation[]) => void
}


const queryKindColor = "gray.300"
const connectorColor = "purple.300"

const availableColors = [
  "red.200",
  "orange.200",
  "yellow.200",
  "green.200",
  "teal.200",
  "blue.200",
  "cyan.200",
  "pink.200",
]

const possibleOperations: InputQueryKind[] = [
  {
    kind: "equals",
    requiresInput: true,
    supportsComplexQueries: true,
  },
  {
    kind: "not equals",
    requiresInput: true,
    supportsComplexQueries: true,
  },
  {
    kind: "contains",
    requiresInput: true,
    supportsComplexQueries: true,
  },
  {
    kind: "not contains",
    requiresInput: true,
    supportsComplexQueries: true,
  },
  {
    kind: "starts with",
    requiresInput: true,
    supportsComplexQueries: true,
  },
  {
    kind: "ends with",
    requiresInput: true,
    supportsComplexQueries: true,
  },
  {
    kind: "is empty",
    requiresInput: false,
    supportsComplexQueries: false,
  },
  {
    kind: "is not empty",
    requiresInput: false,
    supportsComplexQueries: false,
  },
]

const PopoverCloseOnClickArea = ({ children }: { children: React.ReactNode }) => {
  // Load popover context
  const popover = usePopoverContext()

  return (
    <Box
      onClick={() => {
        popover.onClose()
      }}
    >
      {children}
    </Box>
  )
}

const AddQueryElementMenu = <T,>({ title, options, onSelect, stringify }: { title: string, options: T[], onSelect: (_choise: T) => void, stringify: (_value: T) => string }) => {
  return (
    <Popover
      placement="auto"
      variant={"solid"}

    // If on mobile, use full screen popover

    // Remove focus outline

    >
      <PopoverTrigger>
        <IconButton
          icon={<FiPlus />}
          aria-label="Add query element"
          size="md"

          // Material design ripple effect + hover effect + color
          _hover={{
            bg: "blue.100",
            color: "blue.800",
          }}
          _active={{
            bg: "blue.200",
            color: "blue.800",
          }}

          // Remove focus outline
          _focus={{
            outline: "none",
          }}

          // Ripple effect with plain CSS
          colorScheme="blue"
        />
      </PopoverTrigger>
      <PopoverContent color='white' bg='blue.800' borderColor='blue.800'>
        <PopoverArrow bg='blue.800' borderColor='blue.800' />
        <PopoverCloseButton />
        <PopoverHeader fontWeight={'bold'}>{title}</PopoverHeader>
        <PopoverBody
          // Enable scrollbar y if too many options
          overflowY="auto"
          maxH={200}
        >
          <PopoverCloseOnClickArea>
            {options.map((option, idx) => (
              <Text
                key={idx}
                cursor="pointer"
                onClick={() => onSelect(option)}
                height={10}
                _hover={{
                  bg: "blue.100",
                  color: "blue.800",
                }}
                _active={{
                  bg: "blue.200",
                  color: "blue.800",
                }}
              >
                {stringify(option)}
              </Text>
            ))}
          </PopoverCloseOnClickArea>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

const QueryElement = ({ backgroundColor, text }: QueryElementProps) => {
  return (
    <Flex
      backgroundColor={backgroundColor}
      borderRadius="md"
      minWidth={100}
      width={"auto"}
      height={70}
      alignItems="center"
      justifyContent="center"
    >
      <Text>{text}</Text>
    </Flex>
  )
}


const CustomerQueryBuilder = ({ queryFields, onQueryGenerated }: CustomerQueryBuilderProps) => {
  const [currentFields, setCurrentFields] = useState<QueryFields>([])
  const availableFields = useMemo(() => queryFields.filter((field) => !currentFields.map((f) => f.name).includes(field)), [currentFields, queryFields])

  {/*
    - Fare in modo che se viene messo un filtro "is empty" o "is not empty" non si possa aggiungere un altro filtro dopo
  */}
  useEffect(() => {
    if (currentFields.length > 0) {
      let filters: FilterLambda[] = []
      currentFields.forEach((field) => {
        field.queryOperations.forEach((operation) => {
          switch (operation.kind.kind) {
            case "equals":
              filters.push((customer) => {
                // Check if string
                if (typeof customer[field.name] == "string") {
                  return String(customer[field.name]).toLowerCase() == operation.value.toLowerCase()
                } else {
                  return customer[field.name] == operation.value
                }
              })
              break
            case "not equals":
              filters.push((customer) => {
                // Check if string
                if (typeof customer[field.name] == "string") {
                  return String(customer[field.name]).toLowerCase() != operation.value.toLowerCase()
                } else {
                  return customer[field.name] != operation.value
                }
              })
              break
            case "contains":
              filters.push((customer) => String(customer[field.name]).includes(operation.value))
              break
            case "not contains":
              filters.push((customer) => !String(customer[field.name]).includes(operation.value))
              break
            case "starts with":
              filters.push((customer) => String(customer[field.name]).startsWith(operation.value))
              break
            case "ends with":
              filters.push((customer) => String(customer[field.name]).endsWith(operation.value))
              break
            case "is empty":
              filters.push((customer) => customer[field.name] == "" || customer[field.name] == null || customer[field.name] == undefined)
              break
            case "is not empty":
              filters.push((customer) => customer[field.name] != "" || customer[field.name] != null || customer[field.name] != undefined)
              break
          }
        })
      })
      // Notify parent component of the generated filters (if any)
      filters.length > 0 && onQueryGenerated(filters)
    }
  }, [currentFields])

  return (
    <VStack alignItems={"flex-start"}>
      {currentFields?.map((field) => (
        <FieldQueryBuilder
          key={field.name}
          field={field}
          possibleOperations={possibleOperations}
          onQueryUpdate={(query) => {
            // Create new query field with updated query operations
            const newField: QueryField = {
              ...field,
              queryOperations: query,
            }

            // Set new query operations for the field
            const newFields = currentFields.map((f) => {
              if (f.name === field.name) {
                return newField
              }
              return f
            })
            setCurrentFields(newFields)
          }}
        />
      ))}

      <Flex width={"150px"} justifyContent={"center"}>
        <AddQueryElementMenu
          title="Create a new filter on a table field"
          options={availableFields}
          onSelect={(selectedField) => {
            const newField: QueryField = {
              name: selectedField,
              color: availableColors[Math.floor(Math.random() * availableColors.length)],
              queryOperations: [],
            }
            setCurrentFields([...currentFields, newField])
          }}
          stringify={(value) => value}
        />
      </Flex>
    </VStack >
  )
}

const FieldQueryBuilder = ({ field, possibleOperations, onQueryUpdate }: FieldQueryBuilderProps) => {
  const [operations, setOperations] = useState<QueryOperation[]>([])

  return (
    <HStack
      gap={2}

      // Enable y axis scrolling if there are too many operations
      overflowY={"auto"}
      height={"auto"}
      maxH={"200px"}
      width={"100%"}
    >
      <QueryElement backgroundColor={field.color} text={field.name} />

      {operations?.map((operation, idx) => (
        <chakra.span key={idx} style={{
          display: "flex",
          alignItems: "center",
          // Remove the margin from the first element
          marginLeft: idx === 0 ? 0 : 4,
          // Set gap
          gap: 4,
        }}>
          <QueryElement backgroundColor={queryKindColor} text={operation.kind.kind} />

          {operation.kind.requiresInput && (
            <FormControl display="inline-block" isInvalid={operation.value === ""}>
              <Input
                type="text"
                placeholder="Value"
                size="sm"
                width={150}
                height={70}
                borderRadius="md"
                onChange={(e) => {
                  // Look for this operation in the array and update it
                  const newOperations = [...operations]
                  newOperations[idx].value = e.target.value
                  // Save changes
                  setOperations(newOperations)
                  onQueryUpdate(newOperations)
                }}
              />
            </FormControl>
          )}
          {operation.nextConnector && (
            <QueryElement backgroundColor={connectorColor} text={operation.nextConnector} />
          )}
        </chakra.span>
      ))}

      <AddQueryElementMenu
        title="Add field query"
        options={possibleOperations}
        onSelect={(selectedOperation) => {
          // Add new operation to field
          const newOperations = [...operations]

          // Set the next connector for the previous operation
          if (newOperations.length > 0) {
            newOperations[newOperations.length - 1].nextConnector = "and"
          }

          // Add the new operation
          newOperations.push({
            kind: selectedOperation,
            value: "",
          })

          // Save the new operations
          setOperations(newOperations)

          // Check if update needed
          if (!selectedOperation.requiresInput) {
            onQueryUpdate(newOperations)
          }
        }}
        stringify={(value) => value.kind as string}
      />
    </HStack>
  )
}

export default CustomerQueryBuilder