import React, { useState, useEffect } from 'react';
import { Box, Accordion, Button, Flex, Text } from '@chakra-ui/react';
import MasterTableRow from './MasterTableRow';
import { ModeType } from './App';

// Define a type for the data items
export interface UniversityData {
  id: number;
  name: string;
  location: string;
  studentFacultyRatio: string;
  icon: string;
  content?: Content;
}

export interface Content {
  undergrad_content?: UndergradContent;
  grad_content?: GradContent;
};

export interface UndergradContent {
  content: string;
};

export interface GradContent {
  content: string;
}

export interface MasterTableProps {
  mode: ModeType;
  toggleMode: () => void;
};

const PAGE_SIZE = 10; // Number of items per page

const MasterTable: React.FC<MasterTableProps> = ({ mode, toggleMode }) => {
  const [data, setData] = useState<UniversityData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Simulate API call for paginated data
  const fetchPageData = async (page: number) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an actual API call like:
      // const response = await fetch(`/api/universities?page=${page}&limit=${PAGE_SIZE}`);
      // const { data, total } = await response.json();
      
      // Simulated API response
      const simulatedData: UniversityData[] = Array.from({ length: PAGE_SIZE }, (_, i) => {
        const globalIndex = page * PAGE_SIZE + i;
        return {
          id: globalIndex + 1,
          name: `The University of the Number ${globalIndex + 1}`,
          location: `Location ${globalIndex + 1}`,
          studentFacultyRatio: `${10 + (globalIndex % 5)}:1`,
          icon: 'FaUniversity',
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
          content: `Undergrad School Blah Blah Blah for University ${id}`
        },
        grad_content: {
          content: `Graduate School Blah Blah Blah for University ${id}`
        }
      });
    }, 500);
  });
  };

  useEffect(() => {
    fetchPageData(currentPage);
  }, [currentPage]);



  const nextPage = () => {
    if ((currentPage + 1) * PAGE_SIZE < totalItems) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };


  return (
    <Box maxW="800px" mx="auto" mt="8">
      <Accordion allowToggle>
        {data.map((item) => (
          <MasterTableRow key={item.id} item={item} mode={mode} toggleMode={toggleMode} onExpand={fetchExpandedEntryContent}/>
        ))}
      </Accordion>
      <Flex justifyContent="space-between" mt="4">
        <Button onClick={prevPage} isDisabled={currentPage === 0 || isLoading}>
          Back
        </Button>
        <Text>
          Page {currentPage + 1} of {Math.ceil(totalItems / PAGE_SIZE)}
        </Text>
        <Button onClick={nextPage} isDisabled={(currentPage + 1) * PAGE_SIZE >= totalItems || isLoading}>
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default MasterTable;
