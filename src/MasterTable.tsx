import React, { useState, useEffect } from 'react';
import { Box, Accordion, Button, Flex, Text } from '@chakra-ui/react';
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
  const [data, setData] = useState<UniversityData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  //Stores Expanded Indecies 
  const [expandedIndex, setExpandedIndex] = useState<number | number[]>([]);

// Get initial state from URL
  const initialPage = parseInt(searchParams.get('page') || '0', 10);
  const initialExpanded = searchParams.get('expanded')?.split(',').map(Number) || [];
  


  // Simulate API call for paginated data
  const fetchPageData = async (page: number) => {
    setIsLoading(true);
    //reset to collapsed state
    setExpandedIndex([]);
    try {
      // In a real app, this would be an actual API call like:
      // const response = await fetch(`/api/universities?page=${page}&limit=${PAGE_SIZE}`);
      // const { data, total } = await response.json();
      
      // Simulated API response
      const simulatedData: UniversityData[] = Array.from({ length: pageSize }, (_, i) => {
        const globalIndex = page * pageSize  + i;
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
                {  cip: "1107", department_name: "Engineering", content: `Engineering grad program info for University ${globalIndex + 1}` },
                {  cip: "0607", department_name: "Business", content: `MBA program info for University ${globalIndex + 1}` }
              ]
            }
          }
        };
      });
      // Simulate total count (1000 in your case)
      const simulatedTotal = 1000;
      
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

      <Accordion 
      allowMultiple
      borderRadius="lg"
      index={expandedIndex}
      onChange={(index) => setExpandedIndex(index)}
      sx={{
        '& > div': {
          borderRadius: 'lg', // Individual item curvature
          overflow: 'hidden', // Ensures child content respects the border radius
          '&:first-of-type': {
            borderTopRadius: 'lg' // Special case for first item
          },
          '&:last-of-type': {
            borderBottomRadius: 'lg' // Special case for last item
          }
        }
      }}
      >
        {data.map((item) => (
          <MasterTableRow key={item.id} item={item} mode={mode} toggleMode={toggleMode} onExpand={fetchExpandedEntryContent}/>
        ))}
     
      </Accordion>
      <Flex justifyContent="space-between" mt="4">
        <Button onClick={prevPage} isDisabled={currentPage === 0 || isLoading}
          bg = {mode === 'undergrad' ? "blue.500" : "green.500"}
          color = "white"
          _hover={{
            bg: mode === 'undergrad' ? "blue.600" : "green.600", 
            color: 'white',
          }}>
          Back
        </Button>
        <Text>
          Page {currentPage + 1} of {Math.ceil(totalItems / pageSize )}
        </Text>
        <Button onClick={nextPage} isDisabled={(currentPage + 1) * pageSize  >= totalItems || isLoading}
          bg = {mode === 'undergrad' ? "blue.500" : "green.500"}
          color = "white"
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
