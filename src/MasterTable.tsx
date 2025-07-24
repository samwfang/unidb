import React, { useState, useEffect } from 'react';
import { Box, Accordion, Button, Flex, Text, Spinner, Input, Tooltip, Grid, GridItem, Menu, FormControl, Select, Badge } from '@chakra-ui/react';
import { Popover, PopoverTrigger, PopoverContent, PopoverBody, Portal } from '@chakra-ui/react';
import MasterTableRow from './MasterTableRow';
import { ModeType } from './App';
import { useSearchParams } from 'react-router-dom';
import { ChevronDownIcon, SearchIcon } from '@chakra-ui/icons';
import ReactSelect, { SingleValue } from 'react-select';
import { ColumnType, ExtraSortType, SortType } from './helpers/DepartmentHelper';
import ColumnPopover from './components/ColumnPopover';
import SearchBar from './components/SearchBar';

// Top level entry for University Data
export interface UniversityData {
  id: number;
  name: string;
  location: string;
  studentFacultyRatio: string;
  icon: string;
  content?: Content;
}

//Content to Render on Entry Expansion
export interface Content {
  undergrad_content?: UndergradContent;
  grad_content?: GradContent;
};

//Content for Undergrad
export interface UndergradContent {
  general_content: {
    total_students: string;
    total_student_percentile: string;
    graduation_rate: string;
    graduation_rate_percentile: string;
    average_class_size: string;
  };
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
    graduation_rate: string;
    average_class_size: string;
  };
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
  const rowHeightEstimate = 61; // Example pixel height per item
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


  // Simulate API call for paginated data
  // In Real API Call, I will also need to return data based on sortingParameter!
  const fetchPageData = async (page: number, sortingParameter: SortType, sortingDeptCID: string, sortingExtraParam: string, searchQuery?: string) => {
    setIsLoading(true);
    setExpandedIndex([]); // Reset expanded indices

    try {
      // Simulate a network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("Fetching new Data with Page #" + page + ", Column = " + sortingParameter + " Dept = " + sortingDeptCID + " Extra = " + sortingExtraParam);
      console.log("Fetching with search:", searchQuery);

      // Simulated API response
      const simulatedData: UniversityData[] = Array.from({ length: pageSize }, (_, i) => {
        const globalIndex = page * pageSize + i;
        return {
          id: globalIndex + 1,
          name: `The University of the Number ${globalIndex + 1}`,
          location: `Location ${globalIndex + 1}`,
          studentFacultyRatio: `${10 + (globalIndex % 5)}:1`,
          icon: 'FaUniversity',
          content: {
            undergrad_content: {
              general_content: {
                total_students: '35,500',
                total_student_percentile: '70',
                graduation_rate: '95%',
                graduation_rate_percentile: '95',
                average_class_size: '550'
              },
              dept_contents: [
                { cip: "1107", department_name: "Computer Science", total_students: '2100', content: `CS department info for University ${globalIndex + 1}` },
                { cip: "2601", department_name: "Biology", content: `Biology department info for University ${globalIndex + 1}` },
                { cip: "0502", department_name: "Ethnic, Cultural Minority, Gender, and Group Studies.", content: `Ethnic department info for University ${globalIndex + 1}` }
              ]
            },
            grad_content: {
              general_content: {
                total_students: '5,500',
                graduation_rate: '92%',
                average_class_size: '51'
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
    fetchPageData(currentPage, sortingParam, sortingDeptCID, sortingExtra, debouncedSearchQuery);
  }, [currentPage, pageSize, sortingParam, sortingDeptCID, sortingExtra, debouncedSearchQuery]);

  // Debounce Search: Only change SearchQuery after 500 ms Delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);



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


  //TODO: Add "Favorited" Functionality
  return (
    <Box maxW="1000px" mx="auto" mt="8"
      position="relative"
      bg="rgba(255, 255, 255, 0.2)" // Semi-transparent white background
      //backdropFilter="blur(16px)"  // Applies the frosted glass effect
      borderRadius="lg"            // Rounds the corners of the box
      boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)" // Softer shadow
      border="1px solid rgba(255, 255, 255, 0.2)" // Lighter border
      p={6}
    >
      <Flex justifyContent="space-between" mb={4}>
        
        <Flex flex="1" maxWidth="600px" mr={4}>
          <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search Universities..."
        />
        </Flex>
        <Button
          onClick={() => { setExpandedIndex([]) }}
          isDisabled={Array.isArray(expandedIndex) ? !expandedIndex.length : true}
          bg={mode === 'undergrad' ? "blue.500" : "gray.600"}
          color="white"
          _hover={{
            bg: mode === 'undergrad' ? "blue.600" : "gray.800",
            color: 'white',
          }}
        >
          Collapse All
        </Button>
      </Flex>

      <Box minH={`${calculatedMinHeight}px`}> {/* Add minimum height for this box */}
        {isLoading ? ( // Show spinner when loading
          <Flex justifyContent="center" alignItems="center" minH="100px">
            <Spinner
              size="xl"
              color={mode === 'undergrad' ? "blue.500" : "gray.600"}
              thickness='4px'
            />
          </Flex>
        ) : (
          <>
            {/* Column Headers */}
            <Grid templateColumns="75px 2fr 1fr 1fr 1fr" gap={4} w="full" alignItems="flex-end" mb={2} px={4}>
              <GridItem textAlign="center">
                <Popover>
                  {({ isOpen }) => (
                    <>
                      <PopoverTrigger>
                        <Button
                          variant="outline"
                          size="sm"
                          fontWeight="bold"
                          rightIcon={<ChevronDownIcon />}
                          bg={sortedByCol == 0 ? "green.500" : isOpen ? "gray.100" : "transparent"}
                          color={sortedByCol == 0 ? "white" : "black"}
                          borderColor={"gray.200"}
                          borderRadius="md"
                          _hover={{
                            bg: sortedByCol == 0 ? 'green.700' : 'gray.100',
                            color: sortedByCol == 0 ? 'white' : 'black'
                          }}
                          zIndex={isOpen ? "popover" : "auto"}
                        >
                          Score
                        </Button>
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
                          borderRadius="lg"
                          pointerEvents="none"
                        />
                      )}
                      <Portal>
                        <PopoverContent zIndex="popover" bg="gray.100" borderRadius="lg"
                          boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)">
                          <PopoverBody p={4}>
                            <Text fontSize="xl" fontWeight="bold">Score</Text>
                            <Badge variant="subtle" colorScheme="pink" ml={1}>
                              WIP
                            </Badge>
                            {sortedByCol == 0  &&
                              <Badge bg="green.200">Currently Sorted By</Badge>
                            }
                            <Text>Custom Scoring is currently a feature in progress!</Text>
                          </PopoverBody>
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
                        <Button
                          variant="outline"
                          size="sm"
                          fontWeight="bold"
                          rightIcon={<ChevronDownIcon />}
                          bg={sortedByCol == 1 ? "green.500" : isOpen ? "gray.100" : "transparent"}
                          color={sortedByCol == 1 ? "white" : "black"}
                          borderColor={"gray.200"}
                          borderRadius="md"
                          _hover={{
                            bg: sortedByCol == 1 ? 'green.700' : 'gray.100',
                            color: sortedByCol == 1 ? 'white' : 'black'
                          }}
                          zIndex={isOpen ? "popover" : "auto"}
                        >
                          University Name
                        </Button>
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
                          borderRadius="lg"
                          pointerEvents="none"
                        />
                      )}
                      <Portal>
                        <PopoverContent zIndex="popover" bg="gray.100" borderRadius="lg"
                          boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)">
                          <PopoverBody p={4} >
                            <Text fontSize="xl" fontWeight="bold"> University Name</Text>
                            {sortedByCol == 1  &&
                              <Badge bg="green.200">Currently Sorted By</Badge>
                            }
                            <Text>The most common name for each university.</Text>
                            <Text fontWeight="bold"> Sort By: </Text>
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
                                      backgroundColor: 'gray.50',
                                      borderColor: '#E2E8F0',
                                      _hover: { borderColor: '#CBD5E0' }
                                    }),
                                    option: (base) => ({
                                      ...base,
                                      backgroundColor: 'white',
                                      color: 'black',
                                      _hover: { backgroundColor: '#F7FAFC' }
                                    })
                                  }}
                                  onChange={onUniversityNameSelectChange}
                                />
                              </FormControl>
                            )}
                            <Button
                              mt={4}
                              colorScheme="blue"
                              size="sm"
                              onClick={applyAlphabeticalSort}
                            >
                              Apply Sort
                            </Button>

                          </PopoverBody>
                        </PopoverContent>
                      </Portal>
                    </>
                  )}
                </Popover>
              </GridItem>

              <GridItem textAlign="center">
                <ColumnPopover departmentCID={columnDepts[0].value} sortedByCol={sortedByCol} departmentName={columnDepts[0].label} columnType={columnTypes[0]} onApply={handleApply} onApplyAndSort={handleApplySort} index={0} />
              </GridItem>
              <GridItem textAlign="center" fontWeight="bold">
                <ColumnPopover departmentCID={columnDepts[1].value} sortedByCol={sortedByCol} departmentName={columnDepts[1].label} columnType={columnTypes[1]} onApply={handleApply} onApplyAndSort={handleApplySort} index={1} />
              </GridItem>
              <GridItem textAlign="center" fontWeight="bold">
                <ColumnPopover departmentCID={columnDepts[2].value} sortedByCol={sortedByCol} departmentName={columnDepts[2].label} columnType={columnTypes[2]} onApply={handleApply} onApplyAndSort={handleApplySort} index={2} />
              </GridItem>
            </Grid>

            <Accordion
              allowMultiple
              borderRadius="lg"
              index={expandedIndex}
              onChange={(index) => setExpandedIndex(index)}
              sx={{
                '& > div': {
                  borderRadius: 'lg',
                  overflow: 'hidden',
                  '&:first-of-type': {
                    borderTopRadius: 'lg'
                  },
                  '&:last-of-type': {
                    borderBottomRadius: 'lg'
                  }
                }
              }}
            >
              {data.map((item, index) => (
                <MasterTableRow rank={(currentPage) * pageSize + index + 1} key={item.id} item={item} mode={mode} columnDepts={columnDepts} columnTypes={columnTypes} toggleMode={toggleMode} onExpand={fetchExpandedEntryContent} />
              ))}
            </Accordion>
          </>
        )}
      </Box>

      <Flex justifyContent="space-between" alignItems="center" mt="4">
        <Button onClick={prevPage} isDisabled={currentPage === 0 || isLoading}
          bg={mode === 'undergrad' ? "blue.500" : "gray.600"}
          color="white"
          _hover={{
            bg: mode === 'undergrad' ? "blue.600" : "gray.800",
            color: 'white',
          }}>
          Back
        </Button>

        <Flex alignItems="center">

          {/* Tooltip only shows if ShowInvalidPageTooltip is true, shows if user inputs a bad page number */}
          <Tooltip
            isOpen={showInvalidPageTooltip}
            label={`Please enter a valid page number between 1 and ${Math.ceil(totalItems / pageSize)}`}
            placement="top"
            hasArrow
            bg="red.500"
            color="white"
          >
            <Text mx={2}>
              Page <Input
                value={pageInput}
                onChange={handlePageInputChange}
                width="60px"
                textAlign="center"
                mr={2}
              /> of {Math.ceil(totalItems / pageSize)}
            </Text>

          </Tooltip>
          <Button onClick={goToPage} isDisabled={isLoading}
            bg={mode === 'undergrad' ? "blue.500" : "gray.600"}
            color="white"
            _hover={{
              bg: mode === 'undergrad' ? "blue.600" : "gray.800",
              color: 'white',
            }}>
            Go
          </Button>
        </Flex>

        <Button onClick={nextPage} isDisabled={(currentPage + 1) * pageSize >= totalItems || isLoading}
          bg={mode === 'undergrad' ? "blue.500" : "gray.600"}
          color="white"
          _hover={{
            bg: mode === 'undergrad' ? "blue.600" : "gray.800",
            color: 'white',
          }}>
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default MasterTable;
