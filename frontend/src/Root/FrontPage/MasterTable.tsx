import React, { useState, useEffect } from 'react';
import { Box, Accordion, Button, Flex, Text, Spinner, Input, Tooltip, Grid, GridItem, Menu, FormControl, Select, Badge } from '@chakra-ui/react';
import { Popover, PopoverTrigger, PopoverContent, PopoverBody, Portal } from '@chakra-ui/react';
import MasterTableRow from './TableEntries/MasterTableRow';
import { ModeType } from "../../helpers/types";
import { useSearchParams } from 'react-router-dom';
import { ChevronDownIcon, SearchIcon } from '@chakra-ui/icons';
import ReactSelect, { SingleValue } from 'react-select';
import { ColumnType, ExtraSortType, SortType } from '../../helpers/DepartmentHelper';
import ColumnPopover from '../../ReusableComponents/ColumnPopover';
import SearchBar from '../../ReusableComponents/SearchBar';
import { useAppTheme } from '../../containers/useTheme';
import { useResponsive } from '../../containers/useResponsive';
import GlassBox from '../../containers/GlassBox';
import ColumnPopoverButton from 'src/containers/ColumnPopoverButton';

// Top level entry for University Data
export interface UniversityData {
  id: number;
  name: string;
  location: string;
  studentFacultyRatio: string;
  icon: string;
  isPublic?: boolean;
  sectorScorecard?: number;
  content?: Content;
}

//Content to Render on Entry Expansion
export interface Content {
  undergrad_content?: UndergradContent;
  grad_content?: GradContent;
};

export interface DemographicsData {
  gender: Array<{ name: string; value: number }>;
  ethnicity: Array<{ name: string; value: number }>;
  income: Array<{ name: string; value: number }>;
}

//Content for Undergrad
export interface UndergradContent {
  general_content: {
    total_students: string;
    total_student_percentile: string;

    graduation_rate: string;
    graduation_rate_percentile: string;

    admissions_rate: string;
    admissions_rate_percentile: string;

    sat_score?: string;
    act_score?: string;
    sat_score_percentile?: string;
    act_score_percentile?: string;

    studentFacultyRatio?: string;
    studentFacultyRatioPercentile?: string;

    avg_household_income?: string;
    avg_household_income_percentile?: string;

    average_class_size: string;
  };
  demographics?: DemographicsData;
  dept_contents?: UGradDeptContent[];
};

//Content for each Department in the Undergrad Program
export interface UGradDeptContent {
  cip: string,
  department_name: string;
  content: string;
  total_students?: string;
  total_student_percentile?: string;
  graduation_rate?: string;
  graduation_rate_percentile?: string;
  average_class_size?: string;
};

//Content for Grad
export interface GradContent {
  general_content: {
    total_students: string;
    total_student_percentile: string;
    graduation_rate: string;
    graduation_rate_percentile?: string;
    admissions_rate?: string;
    admissions_rate_percentile?: string;
    average_class_size: string;

    avg_household_income?: string;
    avg_household_income_percentile?: string;

    studentFacultyRatio?: string;
    studentFacultyRatioPercentile?: string;
  };
  demographics?: DemographicsData;
  dept_contents?: GradDeptContent[];
}

//Content for each Department in the Grad Program
export interface GradDeptContent {
  cip: string,
  department_name: string;
  content: string;
  total_students?: string;
  total_student_percentile?: string;
  graduation_rate?: string;
  graduation_rate_percentile?: string;
  average_class_size?: string;
};

export interface MasterTableProps {
  mode: ModeType;
  toggleMode: () => void;
  pageSize: number;
};


const MasterTable: React.FC<MasterTableProps> = ({ mode, toggleMode, pageSize = 10 }) => {
  //Custom Parameters for App Styling Based on Theme
  const { colorMode, glassBg, glassBorder, modeColor, isDark } = useAppTheme();

  //Search Params to Save State (WIP)
  const [searchParams, setSearchParams] = useSearchParams();


  //Raw Data for Page
  const [data, setData] = useState<UniversityData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  //Stores Expanded Indecies 
  const [expandedIndex, setExpandedIndex] = useState<number | number[]>([]);

  //What is in Page Input Input Box
  const [pageInput, setPageInput] = useState<string>("1");

  //Tooltip for Invalid Page
  const [showInvalidPageTooltip, setShowInvalidPageTooltip] = useState(false);

  // Get initial state from URL
  const initialPage = parseInt(searchParams.get('page') || '0', 10);
  const initialExpanded = searchParams.get('expanded')?.split(',').map(Number) || [];

  // Estimate the height required for each row. This might need adjustment based on your actual design.
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


  const API_BASE_URL = 'http://localhost:8000/api';

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

    try {
      const params = new URLSearchParams();

      // Pagination (convert 0-indexed to 1-indexed)
      params.set('page', String(page + 1));
      params.set('pageSize', String(pageSize));

      // Search
      if (searchQuery) {
        params.set('search', searchQuery);
      }

      // Sort mapping
      if (sortingParameter === ExtraSortType.Alphabetical) {
        params.set('sort', 'name');
        params.set('sortDir', 'asc');
      } else if (sortingParameter === ExtraSortType.ReverseAlphabetical) {
        params.set('sort', 'name');
        params.set('sortDir', 'desc');
      } else {
        params.set('sort', sortingParameter as string);
        params.set('sortDir', sortingExtraParam === 'least' ? 'asc' : 'desc');
      }

      // Department-specific sort
      if (sortingDeptCID && sortingDeptCID !== 'general') {
        params.set('sortDept', sortingDeptCID);
      }

      const response = await fetch(`${API_BASE_URL}/universities?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setData(result.universities);
      setTotalItems(result.total);
    } catch (error) {
      console.error('Failed to fetch page data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  //This function is currently not being used
  const fetchExpandedEntryContent = async (id: number): Promise<{
    undergrad_content?: UndergradContent;
    grad_content?: GradContent;
  }> => {
    // In a real implementation, this would be an actual API call:
    /*
    const response = await fetch(`/api/universities/${id}/content?type=${type}`);
    if (!response.ok) throw new Error('Failed to fetch content');
    const data = await response.json();
    return data.content;
    */

    // Simulation - matches your existing data structure
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({

          // In the future, if content is too much and page loads too slow, we can try to utilize this function
          // to load content for only one entry
        });
      }, 500);
    });
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



  //TODO: Add "Favorited" Functionality
  return (
    <GlassBox
      maxW={{ base: "100%", md: "1100px" }}
      mx="auto"
      position="relative"
      p={{ base: 3, md: 5 }}
    >
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

      {/* Table */}
      <Box
        overflowX={{ base: "auto", md: "hidden" }}
        borderRadius="xl"
        width="100%"
      >
        <Box
          minH={`${calculatedMinHeight}px`}
          minW={{ base: "320px" }}
          w="100%"
        >
          {isLoading ? (
            <Flex justifyContent="center" alignItems="center" minH="200px">
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
                  <MasterTableRow
                    key={item.id}
                    rank={(currentPage) * pageSize + index + 1}
                    item={item}
                    mode={mode}
                    columnDepts={columnDepts.slice(0, visibleColumnCount)}
                    columnTypes={columnTypes.slice(0, visibleColumnCount)}
                    toggleMode={toggleMode}
                    onExpand={fetchExpandedEntryContent}
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
    </GlassBox>
  );
};

export default MasterTable;
