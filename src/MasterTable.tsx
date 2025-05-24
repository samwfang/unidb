import React, { useState, useEffect } from 'react';
import { Box, Accordion, Button, Flex, Text, Spinner, Input, Tooltip } from '@chakra-ui/react';
import MasterTableRow from './MasterTableRow';
import { ModeType } from './App';
import {useSearchParams} from 'react-router-dom';

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

   //Page Input for Going to Custom Page
  const [pageInput, setPageInput] = useState<string>("1");

  //Tooltip for Invalid Page
  const [showInvalidPageTooltip, setShowInvalidPageTooltip] = useState(false);

  // Get initial state from URL
  const initialPage = parseInt(searchParams.get('page') || '0', 10);
  const initialExpanded = searchParams.get('expanded')?.split(',').map(Number) || [];
  
  // Estimate the height required for each row. This might need adjustment based on your actual design.
  const rowHeightEstimate = 61; // Example pixel height per item
  const calculatedMinHeight = pageSize * rowHeightEstimate;


  // Simulate API call for paginated data
const fetchPageData = async (page: number) => {
  setIsLoading(true);
  setExpandedIndex([]); // Reset expanded indices

  try {
    // Simulate a network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

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
              { cip: "1107", department_name: "Computer Science", content: `CS department info for University ${globalIndex + 1}` },
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

  const fetchExpandedEntryContent = async (id: number): Promise<{
    undergrad_content: UndergradContent;
    grad_content: GradContent;
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
        undergrad_content: {
          general_content: {
            total_students: '35,500',
            total_student_percentile: '70',
            graduation_rate: '95%',
            graduation_rate_percentile: '95',
            average_class_size: '550'
          },
          dept_contents: [
            { cip: "1107", department_name: "Computer Science", content: `CS department info for University ${id}` },
            { cip: "2601", department_name: "Biology", content: `Biology department info for University ${id}` },
            { cip: "0502", department_name: "Ethnic, Cultural Minority, Gender, and Group Studies.", content: `Ethnic department info for University ${id}` }
          ]
        },
        grad_content: {
          general_content: {
            total_students: '5,500',
            graduation_rate: '92%',
            average_class_size: '51'
          },
           dept_contents: [
            {  cip: "1107", department_name: "Engineering", content: `Engineering grad program info for University ${id}` },
            {  cip: "0607", department_name: "Business", content: `MBA program info for University ${id}` }
          ]
        }
      });
    }, 500);
  });
  };

  // Refetch page data when either new page is loaded, or size of each page is altered (could be inefficient but IDGAF ;))
  useEffect(() => {
    fetchPageData(currentPage);
  }, [currentPage, pageSize]);


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



  const nextPage = () => {
    if ((currentPage + 1) * pageSize  < totalItems) {
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
      bg="rgba(255, 255, 255, 0.2)" // Semi-transparent white background
      backdropFilter="blur(16px)"  // Applies the frosted glass effect
      borderRadius="lg"            // Rounds the corners of the box
      boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)" // Softer shadow
      border="1px solid rgba(255, 255, 255, 0.2)" // Lighter border
      p={6}
    >
      <Flex justifyContent="flex-end" mb={4}>
        <Button 
          onClick={() => {setExpandedIndex([])}}
          isDisabled={Array.isArray(expandedIndex) ? !expandedIndex.length : true}
          bg = {mode === 'undergrad' ? "blue.500" : "green.500"}
          color = "white"
          _hover={{
            bg: mode === 'undergrad' ? "blue.600" : "green.600", 
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
              color={mode === 'undergrad' ? "blue.500" : "green.500"} 
              thickness='4px'
            />
          </Flex>
        ) : (
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
            {data.map((item) => (
              <MasterTableRow key={item.id} item={item} mode={mode} toggleMode={toggleMode} onExpand={fetchExpandedEntryContent}/>
            ))}
          </Accordion>
        )}
      </Box>
      
       <Flex justifyContent="space-between" alignItems="center" mt="4">
        <Button onClick={prevPage} isDisabled={currentPage === 0 || isLoading}
          bg={mode === 'undergrad' ? "blue.500" : "green.500"}
          color="white"
          _hover={{
            bg: mode === 'undergrad' ? "blue.600" : "green.600", 
            color: 'white',
          }}>
          Back
        </Button>
        
        <Flex alignItems="center">
          <Text mx={2}>
            Page {currentPage + 1} of {Math.ceil(totalItems / pageSize)}
          </Text>
          {/* Tooltip only shows if ShowInvalidPageTooltip is true, shows if user inputs a bad page number */}
          <Tooltip
          isOpen={showInvalidPageTooltip}
          label={`Please enter a valid page number between 1 and ${Math.ceil(totalItems / pageSize)}`}
          placement="top"
          hasArrow
          bg="red.500"
          color="white"
        >
          <Input
            value={pageInput}
            onChange={handlePageInputChange}
            width="60px"
            textAlign="center"
            mr={2}
          />
        </Tooltip>
          <Button onClick={goToPage} isDisabled={isLoading}
            bg={mode === 'undergrad' ? "blue.500" : "green.500"}
            color="white"
            _hover={{
              bg: mode === 'undergrad' ? "blue.600" : "green.600", 
              color: 'white',
            }}>
            Go
          </Button>
        </Flex>
        
        <Button onClick={nextPage} isDisabled={(currentPage + 1) * pageSize >= totalItems || isLoading}
          bg={mode === 'undergrad' ? "blue.500" : "green.500"}
          color="white"
          _hover={{
            bg: mode === 'undergrad' ? "blue.600" : "green.600", 
            color: 'white',
          }}>
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default MasterTable;
