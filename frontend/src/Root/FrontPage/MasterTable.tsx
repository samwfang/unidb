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
  const [rowHeightEstimate, setRowHeightEstimate] = useState(61); // Default desktop height
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
  //Amt of Columns Visible due to Screen Size
  const [visibleColumnCount, setVisibleColumnCount] = useState(3);

  //Current Parameter With Which To Sort Page Data With
  const [sortingParam, setSortingParam] = useState<SortType>(ExtraSortType.Alphabetical);
  const [sortingDeptCID, setSortingDeptCID] = useState<string>("general");
  const [sortingExtra, setSortingExtra] = useState<string>("greatest");

  //Search Queries for Search Bar Functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");


  // Simulate API call for paginated data
  // In Real API Call, I will also need to return data based on sortingParameter!
  const fetchPageData = async (
    page: number,
    pageSize: number, // Add pageSize parameter
    sortingParameter: SortType,
    sortingDeptCID: string,
    sortingExtraParam: string,
    searchQuery?: string
  ) => {
    setIsLoading(true);
    setExpandedIndex([]);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log(`Fetching page ${page} with size ${pageSize}, sort=${sortingParameter}`);

      const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
      const randomRate = () => randomInRange(5, 100);
      const randomStudents = () => randomInRange(1000, 50000).toLocaleString();
      const randomClassSize = () => randomInRange(10, 500);
      const randomPercentile = () => randomInRange(10, 99);
      const randomSAT = () => randomInRange(800, 1600);
      const randomACT = () => randomInRange(16, 36);
      const randomIncome = () => randomInRange(30000, 120000);

      // Simulated API response
      const simulatedData: UniversityData[] = Array.from({ length: pageSize }, (_, i) => {
        const globalIndex = page * pageSize + i;
        const gradRate = randomRate();
        const totalStudents = randomStudents();
        const admissionsRate = randomRate();
        const satScore = randomSAT();
        const actScore = randomACT();
        const avgIncome = randomIncome();

        return {
          id: globalIndex + 1,
          name: `The University of the Number ${globalIndex + 1}`,
          location: `Location ${globalIndex + 1}`,
          studentFacultyRatio: `${10 + (globalIndex % 5)}:1`,
          icon: 'FaUniversity',
          isPublic: globalIndex % 2 === 0,
          sectorScorecard: (globalIndex % 15) + 1,
          content: {
            undergrad_content: {
              general_content: {
                total_students: totalStudents,
                total_student_percentile: randomPercentile().toString(),
                graduation_rate: `${gradRate}`,
                graduation_rate_percentile: randomPercentile().toString(),
                admissions_rate: admissionsRate.toString(),
                admissions_rate_percentile: randomPercentile().toString(),
                sat_score: satScore.toString(),
                act_score: actScore.toString(),
                sat_score_percentile: randomPercentile().toString(),
                act_score_percentile: randomPercentile().toString(),
                studentFacultyRatio: `${10 + (globalIndex % 5)}:1`,
                studentFacultyRatioPercentile: randomPercentile().toString(),
                avg_household_income: avgIncome.toLocaleString(),
                avg_household_income_percentile: randomPercentile().toString(),
                average_class_size: randomClassSize().toString()
              },
              demographics: {
                gender: [
                  { name: 'Male', value: 48 },
                  { name: 'Female', value: 50 },
                  { name: 'Other', value: 2 },
                ],
                ethnicity: [
                  { name: 'White', value: 30 },
                  { name: 'Black', value: 20 },
                  { name: 'Asian', value: 25 },
                  { name: 'Hispanic', value: 15 },
                  { name: 'Other', value: 10 },
                ],
                income: [
                  { name: '<$30k', value: 20 },
                  { name: '$30k-$60k', value: 30 },
                  { name: '>$60k', value: 50 }
                ]
              },
              dept_contents: [
                {
                  cip: "1107",
                  department_name: "Computer Science",
                  total_students: '2100',
                  total_student_percentile: randomPercentile().toString(),
                  graduation_rate: `${gradRate + 5}`,
                  graduation_rate_percentile: randomPercentile().toString(),
                  average_class_size: randomClassSize().toString(),
                  content: `CS department info for University ${globalIndex + 1}`
                },
                {
                  cip: "2601",
                  department_name: "Biology",
                  total_students: '1800',
                  total_student_percentile: randomPercentile().toString(),
                  graduation_rate: `${gradRate + 2}`,
                  graduation_rate_percentile: randomPercentile().toString(),
                  average_class_size: randomClassSize().toString(),
                  content: `Biology department info for University ${globalIndex + 1}`
                },
                {
                  cip: "0502",
                  department_name: "Ethnic, Cultural Minority, Gender, and Group Studies",
                  total_students: '500',
                  total_student_percentile: randomPercentile().toString(),
                  graduation_rate: `${gradRate + 8}`,
                  graduation_rate_percentile: randomPercentile().toString(),
                  average_class_size: randomClassSize().toString(),
                  content: `Ethnic department info for University ${globalIndex + 1}`
                }
              ]
            },
            grad_content: {
              general_content: {
                total_students: '5,500',
                total_student_percentile: randomPercentile().toString(),
                graduation_rate: '92%',
                average_class_size: '51'
              },
              demographics: {
                gender: [
                  { name: 'Male', value: 48 },
                  { name: 'Female', value: 50 },
                  { name: 'Other', value: 2 },
                ],
                ethnicity: [
                  { name: 'White', value: 30 },
                  { name: 'Black', value: 20 },
                  { name: 'Asian', value: 25 },
                  { name: 'Hispanic', value: 15 },
                  { name: 'Other', value: 10 },
                ],
                income: [
                  { name: '<$30k', value: 20 },
                  { name: '$30k-$60k', value: 30 },
                  { name: '>$60k', value: 50 }
                ]
              },
              dept_contents: [
                { cip: "1107", department_name: "Engineering", content: `Engineering grad program info for University ${globalIndex + 1}` },
                { cip: "0607", department_name: "Business", content: `MBA program info for University ${globalIndex + 1}` }
              ]
            }
          }
        };
      });

      const simulatedTotal = 1000; // Total number of items in the dataset

      setData(simulatedData);
      setTotalItems(simulatedTotal);
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


  // Detect screen size and adjust column count
  // <768px is one column
  // 768-1024 is two columns
  // >1024px is three columns
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setVisibleColumnCount(1);
      }
      else if (window.innerWidth < 768) {
        setVisibleColumnCount(2);
        setRowHeightEstimate(45);
      } else if (window.innerWidth < 1024) {
        setVisibleColumnCount(3);
        setRowHeightEstimate(55);
      } else {
        setVisibleColumnCount(3);
        setRowHeightEstimate(61);
      }
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);




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
      maxW={{ base: "100vw", md: "1100px" }}
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
          minW={{ base: "300px" }}
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
