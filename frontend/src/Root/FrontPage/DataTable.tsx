import React, { useState, useEffect } from 'react';
import { Box, Accordion, Button, Flex, Text, Spinner, Input, Tooltip, Grid, Circle } from '@chakra-ui/react';
import { ModeType } from "../../helpers/types";
import { WarningIcon } from '@chakra-ui/icons';
import SearchBar from '../../ReusableComponents/SearchBar';
import { useAppTheme } from '../../containers/useTheme';
import { useResponsive } from '../../containers/useResponsive';
import GlassBox from '../../containers/GlassBox';

export interface FetchPageParams<S extends string = string> {
  page: number;
  pageSize: number;
  sort: S;
  sortDept: string;
  sortExtra: string;
  search?: string;
}

export interface FetchPageResult<T> {
  items: T[];
  total: number;
}

//Opaque per-column state held by the table and passed through to headers and rows.
//The meaning of `value` (e.g. a column metric type) is defined by the table wrapper.
export interface TableColumnState<C> {
  key: string;
  label: string;
  value: C;
}

//Context handed to every header component. `index` is the column's position in the
//full `columns` array (not the responsive-shown subset). `S` is the type of the
//table's sort keys (e.g. `SortType` for university tables).
export interface ColumnHeaderContext<C, S extends string = string> {
  mode: ModeType;
  index: number;
  isSorted: boolean;
  state: TableColumnState<C> | null;
  updateColumnState: (index: number, s: TableColumnState<C>) => void;
  applySort: (index: number, sortKey: S, sortDept: string, sortExtra: string) => void;
}

//Defines a single header column. Headers render their own GridItem, so alignment,
//popover UI and styling are all owned by the wrapper-provided header component.
//`responsive: false` columns are always shown; responsive columns are sliced by
//`visibleColumnCount` (in order) on smaller screens.
export interface DataTableColumn<C, S extends string = string> {
  id: string;
  responsive?: boolean;
  initial?: TableColumnState<C>;
  template: { base: string; md: string };
  header: React.ComponentType<ColumnHeaderContext<C, S>>;
}

export interface DataRowProps<T, C> {
  rank: number;
  item: T;
  mode: ModeType;
  //One entry per shown responsive column (in order, `null` when the column has no
  //state), so row cells always line up with the header columns.
  columnState: (TableColumnState<C> | null)[];
  toggleMode: () => void;
  onExpand: (id: number) => Promise<unknown>;
}

export interface DataTableProps<T extends { id: number }, C, S extends string = string> {
  mode: ModeType;
  toggleMode: () => void;
  pageSize: number;
  columns: DataTableColumn<C, S>[];
  searchPlaceholder?: string;
  initialSortingCol: number;
  initialSortingParam: S;
  fetchPage: (params: FetchPageParams<S>) => Promise<FetchPageResult<T>>;
  RowComponent: React.ComponentType<DataRowProps<T, C>>;
  onExpand?: (id: number) => Promise<unknown>;
}

const DataTable = <T extends { id: number }, C, S extends string = string>({
  mode,
  toggleMode,
  pageSize = 10,
  columns,
  searchPlaceholder = "Search universities...",
  initialSortingCol,
  initialSortingParam,
  fetchPage,
  RowComponent,
  onExpand,
}: DataTableProps<T, C, S>) => {
  //Custom Parameters for App Styling Based on Theme
  const { colorMode, glassBg, glassBorder, modeColor, isDark } = useAppTheme();

  //Raw Data for Page
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  //Stores Expanded Indices 
  const [expandedIndex, setExpandedIndex] = useState<number | number[]>([]);

  //What is in Page Input Input Box
  const [pageInput, setPageInput] = useState<string>("1");

  //Tooltip for Invalid Page
  const [showInvalidPageTooltip, setShowInvalidPageTooltip] = useState(false);

  // Estimate of the height required to render a full page of rows, used to keep the
  // table height stable while loading (rows are only rendered once the fetch completes).
  const responsive = useResponsive();
  const { rowHeightEstimate, visibleColumnCount } = responsive;
  const calculatedMinHeight = pageSize * rowHeightEstimate;

  //Per-column state (parallel to the `columns` array; null for static columns)
  const [columnState, setColumnState] = useState<(TableColumnState<C> | null)[]>(() => columns.map(c => c.initial ?? null));
  //Which column is sorted by
  const [sortedByCol, setSortedByCol] = useState<number>(initialSortingCol);


  //Current Parameter With Which To Sort Page Data With
  const [sortingParam, setSortingParam] = useState<S>(initialSortingParam);
  const [sortingDeptCID, setSortingDeptCID] = useState<string>("general");
  const [sortingExtra, setSortingExtra] = useState<string>("greatest");

  //Search Queries for Search Bar Functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  //Columns to display: static columns always show; responsive columns are sliced
  //by the number that fits on the current screen.
  const shownColumns: { col: DataTableColumn<C, S>; index: number }[] = [];
  let responsiveShown = 0;
  columns.forEach((col, index) => {
    if (col.responsive === false) {
      shownColumns.push({ col, index });
      return;
    }
    if (responsiveShown < visibleColumnCount) {
      shownColumns.push({ col, index });
      responsiveShown++;
    }
  });

  //Column state passed to rows: one entry per shown responsive column (in order),
  //so row cells always line up with the header columns (null when no state exists).
  const shownState: (TableColumnState<C> | null)[] = [];
  shownColumns.forEach(({ col, index }) => {
    if (col.responsive !== false) {
      shownState.push(columnState[index] ?? null);
    }
  });

  const fetchPageData = async (
    page: number,
    pageSize: number,
    sortingParameter: S,
    sortingDeptCID: string,
    sortingExtraParam: string,
    searchQuery?: string
  ) => {
    setIsLoading(true);
    setExpandedIndex([]);
    setError(null);

    try {
      const result = await fetchPage({
        page,
        pageSize,
        sort: sortingParameter,
        sortDept: sortingDeptCID,
        sortExtra: sortingExtraParam,
        search: searchQuery,
      });
      setData(result.items);
      setTotalItems(result.total);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch page data:', error);
      setError(error instanceof Error && error.message.startsWith('API error')
        ? `The server returned an error (${error.message.replace('API error: ', '')}) while loading data.`
        : 'Could not reach the server. The server could be down or overloaded. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // REFETCH PAGE DATA WHEN:
  // -New page is loaded
  // -Size of each page is altered (could be inefficient but IDGAF ;))
  // -Sorting Parameter Changes
  useEffect(() => {
    fetchPageData(currentPage, pageSize, sortingParam, sortingDeptCID, sortingExtra, debouncedSearchQuery);
  }, [currentPage, pageSize, sortingParam, sortingDeptCID, sortingExtra, debouncedSearchQuery]);



  // DEBOUNCE SEARCH FUNCTIONALITY:
  // Debounce Search: Only change SearchQuery after 500 ms Delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);





  // SORTING AND COLUMN CHANGE OPERATIONS

  //Updates the state of a single column (e.g. selected department / metric)
  const updateColumnState = (index: number, newState: TableColumnState<C>) => {
    const updated = columnState.map((item, i) =>
      i === index ? newState : item
    );
    setColumnState(updated);
  };

  //Sets the table's active sort and marks the given column as the sorted one
  const applySort = (index: number, sortKey: S, sortDept: string, sortExtra: string) => {
    console.log("Applying sort:", sortExtra);
    setSortingParam(sortKey);
    setSortingDeptCID(sortDept);
    setSortingExtra(sortExtra);
    setSortedByCol(index);
  };

  // TABLE PAGINATION

  const nextPage = () => {
    if ((currentPage + 1) * pageSize < totalItems) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  // Direct page navigation
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const goToPage = () => {
    const pageNumber = Number(pageInput);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= Math.ceil(totalItems / pageSize)) {
      setCurrentPage(pageNumber - 1);
      setShowInvalidPageTooltip(false);
    } else {
      setShowInvalidPageTooltip(true);
      setTimeout(() => setShowInvalidPageTooltip(false), 2000);
    }
  };


  // PAGE CHANGE FUNCTIONALITY: LOGIC TO SHIFT PAGE ON PAGE SIZE CHANGE
  // Track previous page size
  const prevPageSizeRef = React.useRef(pageSize);
  //Change current page based on page size selection
  useEffect(() => {
    if (prevPageSizeRef.current !== pageSize) {
      const firstVisibleIndex = currentPage * prevPageSizeRef.current;
      const newPage = Math.floor(firstVisibleIndex / pageSize);
      setCurrentPage(newPage);
      prevPageSizeRef.current = pageSize;
    }
  }, [pageSize, currentPage]);


  // Change Page Input to Show Current Page
  useEffect(() => {
    setPageInput(((currentPage + 1).toString()))
  }, [currentPage]);


  return (
    <GlassBox
      maxW={{ base: "100%", md: "1100px" }}
      mx="auto"
      position="relative"
      p={{ base: 3, md: 5 }}
    >
      <>
      {/* Toolbar */}
      <Flex justifyContent="space-between" alignItems="center" mb={5} gap={3}>
        <Flex flex="1" maxWidth="500px">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={searchPlaceholder}
          />
        </Flex>
        <Button
          onClick={() => { setExpandedIndex([]) }}
          isDisabled={Array.isArray(expandedIndex) ? !expandedIndex.length : true}
          variant="secondary"
          size="sm"
        >
          Collapse All
        </Button>
      </Flex>

      {error ? (
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          minH="240px"
          py={8}
          gap={3}
        >
          <Circle
            size="56px"
            bg={isDark ? 'rgba(255, 99, 132, 0.12)' : 'rgba(245, 101, 101, 0.1)'}
          >
            <WarningIcon color={isDark ? 'red.400' : 'red.500'} boxSize={6} />
          </Circle>
          <Text fontSize="lg" fontWeight="600" color={isDark ? 'gray.100' : 'gray.800'}>
            Couldn't load university data
          </Text>
          <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'} maxW="420px">
            {error}
          </Text>
          <Button
            mt={2}
            variant="primary"
            size="sm"
            onClick={() => fetchPageData(currentPage, pageSize, sortingParam, sortingDeptCID, sortingExtra, debouncedSearchQuery)}
          >
            Retry
          </Button>
        </Flex>
      ) : (
        <>
      {/* Table */}
      <Box
        overflowX={{ base: "auto", md: "hidden" }}
        borderRadius="xl"
        width="100%"
      >
        <Box
          minW={{ base: "320px" }}
          w="100%"
        >
          {isLoading ? (
            <Flex justifyContent="center" alignItems="center" minH={`${calculatedMinHeight}px`}>
              <Spinner size="lg" thickness="3px" />
            </Flex>
          ) : (
            <>
              {/* Column Headers */}
              <Grid
                templateColumns={{
                  base: shownColumns.map(({ col }) => col.template.base).join(' '),
                  md: shownColumns.map(({ col }) => col.template.md).join(' ')
                }}
                gap={{ base: 2, md: 4 }}
                w="full"
                alignItems="center"
                mb={1}
                px={{ base: 2, md: 3 }}
                py={2}
                borderBottom="1px solid"
                borderColor={colorMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
              >
                {shownColumns.map(({ col, index }) => {
                  const Header = col.header;
                  return (
                    <Header
                      key={col.id}
                      mode={mode}
                      index={index}
                      isSorted={sortedByCol === index}
                      state={columnState[index]}
                      updateColumnState={updateColumnState}
                      applySort={applySort}
                    />
                  );
                })}
              </Grid>

              {/* Table Rows */}
              <Accordion
                allowMultiple
                index={expandedIndex}
                onChange={(index) => setExpandedIndex(index)}
                border="none"
              >
                {data.map((item, index) => (
                  <RowComponent
                    key={item.id}
                    rank={(currentPage) * pageSize + index + 1}
                    item={item}
                    mode={mode}
                    columnState={shownState}
                    toggleMode={toggleMode}
                    onExpand={onExpand || (async () => {})}
                  />
                ))}
              </Accordion>
            </>
          )}
        </Box>
      </Box>

      {/* Pagination */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mt={4}
        pt={4}
        borderTop="1px solid"
        borderColor={colorMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
      >
        <Button
          onClick={prevPage}
          isDisabled={currentPage === 0 || isLoading}
          variant="secondary"
          size="sm"
        >
          Back
        </Button>

        <Flex alignItems="center" gap={2}>
          <Tooltip
            isOpen={showInvalidPageTooltip}
            label={`Enter a page between 1 and ${Math.ceil(totalItems / pageSize)}`}
            placement="top"
            hasArrow
            bg="red.500"
            color="white"
          >
            <Flex alignItems="center" gap={1.5} fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
              <Text>Page</Text>
              <Input
                value={pageInput}
                onChange={handlePageInputChange}
                width="50px"
                textAlign="center"
                size="sm"
                borderRadius="md"
                fontSize="sm"
                fontWeight="500"
              />
              <Text>of {Math.ceil(totalItems / pageSize)}</Text>
            </Flex>
          </Tooltip>
          <Button onClick={goToPage} isDisabled={isLoading} variant="primary" size="sm">
            Go
          </Button>
        </Flex>

        <Button
          onClick={nextPage}
          isDisabled={(currentPage + 1) * pageSize >= totalItems || isLoading}
          variant="secondary"
          size="sm"
        >
          Next
        </Button>
      </Flex>
        </>
      )}
        </>
    </GlassBox>
  );
};

export default DataTable;
