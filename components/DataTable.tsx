import { useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, chakra, Icon, Box, Input, ButtonGroup, IconButton, HStack, Text, TableContainer, Tooltip, Stack } from "@chakra-ui/react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel
} from "@tanstack/react-table";
import { FiArrowDown, FiArrowLeft, FiArrowLeftCircle, FiArrowRight, FiArrowRightCircle, FiArrowUp } from "react-icons/fi";

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
};

export function DataTable<Data extends object>({
  data,
  columns
}: DataTableProps<Data>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [inputValid, setInputValid] = useState<boolean>(true);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting
    }
  });

  return (
    <Box>
      <TableContainer>
        <Table>
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                  const meta: any = header.column.columnDef.meta;
                  return (
                    <Th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      isNumeric={meta?.isNumeric}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                      <chakra.span pl="4">
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === "desc" ? (
                            <Icon aria-label="sorted descending" as={FiArrowDown} />
                          ) : (
                            <Icon aria-label="sorted ascending" as={FiArrowUp} />
                          )
                        ) : null}
                      </chakra.span>
                    </Th>
                  );
                })}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                  const meta: any = cell.column.columnDef.meta;
                  return (
                    <Td key={cell.id} isNumeric={meta?.isNumeric}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>
                  );
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Table controls */}
      <HStack marginTop={3}>
        <ButtonGroup isAttached paddingRight={3}>
          <Tooltip label="Go to first page" isDisabled={!table.getCanPreviousPage()}>
            <IconButton
              icon={<FiArrowLeftCircle />}
              aria-label="Go to first page"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            />
          </Tooltip>

          <Tooltip label="Go to previous page" isDisabled={!table.getCanPreviousPage()}>
            <IconButton
              icon={<FiArrowLeft />}
              aria-label="Go to previous page"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            />
          </Tooltip>

          <Tooltip label="Go to next page" isDisabled={!table.getCanNextPage()}>
            <IconButton
              icon={<FiArrowRight />}
              aria-label="Go to next page"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            />
          </Tooltip>

          <Tooltip label="Go to last page" isDisabled={!table.getCanNextPage()}>
            <IconButton
              icon={<FiArrowRightCircle />}
              aria-label="Go to last page"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            />
          </Tooltip>
        </ButtonGroup>
        <Stack
          // On mobile, the pagination controls should be stacked
          direction={["column", "row"]}
          alignItems="center"
          justifyContent="center"

          // Border left on mobile
          borderLeft={["1px solid black", "none"]}
          paddingLeft={[3, 0]}
          marginLeft={[3, 0]}

          // Border top on desktop
          borderTop={["none", "1px solid black"]}
          paddingTop={[0, 3]}
          marginTop={[0, 3]}
        >
          <Text>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</Text>
          <HStack

                  
          >
            <Text>Go to page:</Text>
            <Input
              type="number"
              isInvalid={!inputValid}
              _focus={!inputValid ? { borderColor: "red.500", boxShadow: "box-shadow: 0 0 0 1px #E53E3E;" } : {}}
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;

                // Check if page is valid
                if (page < 0 || page > table.getPageCount() - 1) {
                  setInputValid(false);
                } else {
                  setInputValid(true);
                  table.setPageIndex(page);
                }
              }}
              min={1}
              max={table.getPageCount()}
              w="60px"
            />
          </HStack>
        </Stack>
      </HStack>
    </Box >
  );
}
