import React, { useState, useEffect } from 'react';
import { Box, Accordion, Button, Flex, Text } from '@chakra-ui/react';
import MasterTableRow from '../MasterTableRow';

// Define a type for the data items
export interface UniversityData {
    id: number;
    name: string;
    location: string;
    studentFacultyRatio: string;
    icon: string;
    undergrad_content: string;
    grad_content: string;
  }
  

const PAGE_SIZE = 10;

const InfiniteAccordion: React.FC = () => {
  const [data, setData] = useState<UniversityData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.example.com/universities?page=${page}&size=${PAGE_SIZE}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result: UniversityData[] = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const nextPage = () => {
    if (!isLoading) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (!isLoading && currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <Box maxW="800px" mx="auto" mt="8">
      <Accordion allowToggle>
        {data.map((item) => (
          <MasterTableRow key={item.id} item={item} />
        ))}
      </Accordion>
      <Flex justifyContent="space-between" mt="4" alignItems="center">
        <Button onClick={prevPage} isDisabled={currentPage === 0 || isLoading}>
          Back
        </Button>
        <Text>
          Page {currentPage + 1}
        </Text>
        <Button onClick={nextPage} isDisabled={data.length < PAGE_SIZE || isLoading}>
          Next
        </Button>
      </Flex>
    </Box>
  );
};
