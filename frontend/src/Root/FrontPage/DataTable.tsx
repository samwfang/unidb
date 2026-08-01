import React, { useState, useEffect } from 'react';
import { Box, Accordion, Button, Flex, Text, Spinner, Input, Tooltip, Grid, GridItem, FormControl, Badge, Circle } from '@chakra-ui/react';
import { Popover, PopoverTrigger, PopoverContent, PopoverBody, Portal } from '@chakra-ui/react';
import { ModeType } from "../../helpers/types";
import { WarningIcon } from '@chakra-ui/icons';
import ReactSelect, { SingleValue } from 'react-select';
import { ColumnType, ExtraSortType, SortType } from '../../helpers/DepartmentHelper';
import ColumnPopover from '../../ReusableComponents/ColumnPopover';
import SearchBar from '../../ReusableComponents/SearchBar';
import { useAppTheme } from '../../containers/useTheme';
import { useResponsive } from '../../containers/useResponsive';
import GlassBox from '../../containers/GlassBox';
import ColumnPopoverButton from 'src/containers/ColumnPopoverButton';

export interface FetchPageParams {
  page: number;
  pageSize: number;
  sort: SortType;
  sortDept: string;
  sortExtra: string;
  search?: string;
}

export interface FetchPageResult<T> {
  items: T[];
  total: number;
}

export interface DataRowProps<T> {
  rank: number;
  item: T;
  mode: ModeType;
  columnDepts: { value: string, label: string }[];
  columnTypes: ColumnType[];
  toggleMode: () => void;
  onExpand: (id: number) => Promise<unknown>;
}

export interface DataTableProps<T extends { id: number }> {
  mode: ModeType;
  toggleMode: () => void;
  pageSize: number;
  fetchPage: (params: FetchPageParams) => Promise<FetchPageResult<T>>;
  RowComponent: React.ComponentType<DataRowProps<T>>;
  onExpand?: (id: number) => Promise<unknown>;
}

const DataTable = <T extends { id: number },>({ mode, toggleMode, pageSize = 10, fetchPage, RowComponent, onExpand }: DataTableProps<T>) => {
  //Custom Parameters for App Styling Based on Theme
  const { colorMode, glassBg, glassBorder, modeColor, isDark } = useAppTheme();

  //Raw Data for Page
  const [data, setData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  //Stores Expanded Indecies 
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

  //Selected Column Options
  const [selectedNameSortingOption, setSelectedNameSortingOption] = useState<SingleValue<{ value: string; label: string }>>(null);
  //Selected Column Types (Default: Location, Grad Rate, Total Students)
  const [columnTypes, setColumnTypes] = useState<ColumnType[]>([ColumnType.Location, ColumnType.GraduationRate, ColumnType.TotalStudents]);
  //Selected Department for Each Column
  const [columnDepts, setColumnDepts] = useState<{ value: string, label: string }[]>([{ value: "general", label: "General" },
  { value: "general", label: "General" }, { value: "general", label: "General" }]);
  //Which column is sorted by
  const [sortedByCol, setSortedByCol] = useState<number>(1);


  //Current Parameter With Which To Sort Page Data With
  const [sortingParam, setSortingParam] = useState<SortType>(ExtraSortType.Alphabetical);
  const [sortingDeptCID, setSortingDeptCID] = useState<string>("general");
  const [sortingExtra, setSortingExtra] = useState<string>("greatest");

  //Search Queries for Search Bar Functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const fetchPageData = async (
    page: number,
    pageSize: number,
    sortingParameter: SortType,
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





  //HARDCODED UNIVERSITY NAME SORTING OPTION

  // Change Preliminary Sorting Option Selected Under the University Name Popup (Hardcoded)
  const onUniversityNameSelectChange = (option: SingleValue<{ value: string; label: string }>) => {
    setSelectedNameSortingOption(option);
  };

  const applyAlphabeticalSort = () => {
    if (selectedNameSortingOption) {
      // Trust that you will always use a valid SortType as the value of a Sort Option
      setSortingParam(selectedNameSortingOption.value as SortType);
      setSortedByCol(1);
      console.log('Selected option:', sortingParam);
    } else {
      console.log('No option selected.');
    }
  };

  // SORTING AND COLUMN CHANGE OPERATIONS FOR OTHER COLUMNS

  const handleApplySort = (index: number, newCID: string, newDept: string, newColumnType: ColumnType, sortOption: string) => {
    // First Apply 
    console.log("Applying sort:", sortOption);
    const updatedItems = columnDepts.map((item, i) =>
      i === index ? { value: newCID, label: newDept } : item
    );
    setColumnDepts(updatedItems)
    const updatedColumnTypes = columnTypes.map((item, i) =>
      i === index ? newColumnType : item
    );
    setColumnTypes(updatedColumnTypes)

    //Then Set Sorting Parameters

    //Set Base Sorting Param as the Column Type of the current Column
    setSortingParam(newColumnType)

    //Set Sorting Department as Department of current Column
    setSortingDeptCID(newCID)

    //Set Sorting Extra parameter
    setSortingExtra(sortOption)

    //Update
    setSortedByCol(index + 2)

  };

  //Changes the Department Selection for a specific index
  const handleApply = (index: number, newCID: string, newDept: string, newColumnType: ColumnType) => {
    const updatedItems = columnDepts.map((item, i) =>
      i === index ? { value: newCID, label: newDept } : item
    );
    setColumnDepts(updatedItems)
    const updatedColumnTypes = columnTypes.map((item, i) =>
      i === index ? newColumnType : item
    );
    setColumnTypes(updatedColumnTypes)
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
      {mode === ModeType.Grad ? (
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          minH="300px"
          py={8}
          px={4}
          gap={3}
        >
          <Circle
            size="64px"
            bg={isDark ? 'rgba(168, 85, 247, 0.12)' : 'rgba(168, 85, 247, 0.1)'}
          >
            <WarningIcon color={isDark ? 'purple.400' : 'purple.500'} boxSize={7} />
          </Circle>
          <Text fontSize="xl" fontWeight="600" color={isDark ? 'gray.100' : 'gray.800'}>
            Graduate Mode is Under Construction
          </Text>
          <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'} maxW="420px" lineHeight="tall">
            We're currently building graduate program data. Please check back soon, or explore undergraduate programs in the meantime.
          </Text>
          <Button mt={2} variant="primary" size="sm" onClick={toggleMode}>
            Explore Undergraduate Mode
          </Button>
        </Flex>
      ) : (
        <>
      {/* Toolbar */}
      <Flex justifyContent="space-between" alignItems="center" mb={5} gap={3}>
        <Flex flex="1" maxWidth="500px">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search universities..."
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
                  base: `50px minmax(100px, 1fr) ${'minmax(50px, 1fr) '.repeat(visibleColumnCount)}`,
                  md: "60px 2fr 1fr 1fr 1fr"
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
                <GridItem textAlign="center">
                  <Popover>
                    {({ isOpen }) => (
                      <>
                        <PopoverTrigger>
                          <ColumnPopoverButton isActivated={sortedByCol === 0} isOpen={isOpen}>
                            Score
                          </ColumnPopoverButton>
                        </PopoverTrigger>
                        {isOpen && (
                          <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            backdropFilter="blur(12px)"
                            bg="rgba(0, 0, 0, 0.1)"
                            zIndex="overlay"
                            borderRadius="xl"
                            pointerEvents="none"
                          />
                        )}
                        <Portal>
                          <PopoverContent>
                            <GlassBox p={4}>
                              <Text fontSize="lg" fontWeight="600">Score</Text>
                              <Badge variant="subtle" colorScheme="pink" ml={1} fontSize="2xs">WIP</Badge>
                              {sortedByCol === 0 && <Badge colorScheme="green" ml={2} fontSize="2xs">Sorted</Badge>}
                              <Text fontSize="sm" mt={2} color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
                                Custom scoring is currently in progress!
                              </Text>
                            </GlassBox>
                          </PopoverContent>
                        </Portal>
                      </>
                    )}
                  </Popover>
                </GridItem>
                <GridItem textAlign="left">
                  <Popover>
                    {({ isOpen }) => (
                      <>
                        <PopoverTrigger>
                          <ColumnPopoverButton isActivated={sortedByCol === 1} isOpen={isOpen} maxWidth="120px">
                            Name
                          </ColumnPopoverButton>
                        </PopoverTrigger>
                        {isOpen && (
                          <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            backdropFilter="blur(12px)"
                            bg="rgba(0, 0, 0, 0.1)"
                            zIndex="overlay"
                            borderRadius="xl"
                            pointerEvents="none"
                          />
                        )}
                        <Portal>
                          <PopoverContent zIndex="popover">
                            <GlassBox p={4}>
                              <Text fontSize="lg" fontWeight="600">University Name</Text>
                              {sortedByCol === 1 && <Badge colorScheme="green" ml={2} fontSize="2xs">Sorted</Badge>}
                              <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} mt={1}>
                                The most common name for each university.
                              </Text>
                              <Text fontWeight="600" fontSize="sm" mt={3}>Sort by:</Text>
                              {isOpen && (
                                <FormControl mt={2}>
                                  <ReactSelect
                                    value={selectedNameSortingOption}
                                    options={[
                                      { value: ExtraSortType.Alphabetical, label: 'Alphabetical A-Z' },
                                      { value: ExtraSortType.ReverseAlphabetical, label: 'Alphabetical Z-A' }
                                    ]}
                                    placeholder="Select sort option"
                                    styles={{
                                      control: (base) => ({
                                        ...base,
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                                        borderRadius: '8px',
                                        minHeight: '36px',
                                      }),
                                      option: (base) => ({
                                        ...base,
                                        backgroundColor: isDark ? '#1a202c' : 'white',
                                        color: isDark ? 'white' : 'black',
                                        fontSize: '14px',
                                      })
                                    }}
                                    onChange={onUniversityNameSelectChange}
                                  />
                                </FormControl>
                              )}
                              <Button mt={3} variant="primary" size="sm" onClick={applyAlphabeticalSort}>
                                Apply Sort
                              </Button>
                            </GlassBox>
                          </PopoverContent>
                        </Portal>
                      </>
                    )}
                  </Popover>
                </GridItem>

                {Array.from({ length: visibleColumnCount }).map((_, index) => (
                  <GridItem key={index} textAlign="center" fontWeight="600" fontSize="sm"
                    color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
                    <ColumnPopover
                      departmentCID={columnDepts[index].value}
                      sortedByCol={sortedByCol}
                      departmentName={columnDepts[index].label}
                      columnType={columnTypes[index]}
                      onApply={handleApply}
                      onApplyAndSort={handleApplySort}
                      index={index}
                    />
                  </GridItem>
                ))}
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
                    columnDepts={columnDepts.slice(0, visibleColumnCount)}
                    columnTypes={columnTypes.slice(0, visibleColumnCount)}
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
      )}
    </GlassBox>
  );
};

export default DataTable;
