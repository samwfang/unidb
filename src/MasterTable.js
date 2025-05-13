// InfiniteAccordion.js
import React, { useState, useEffect } from 'react';
import { Box, Accordion, Button, Flex, Text } from '@chakra-ui/react';
import MasterTableRow from './MasterTableRow';

const PAGE_SIZE = 10; // Number of items per page

const InfiniteAccordion = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  // Simulate fetching data
  const fetchData = () => {
    const simulatedData = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `University ${i + 1}`,
      location: `Location ${i + 1}`,
      studentFacultyRatio: `${10 + (i % 5)}:1`,
      icon: 'FaUniversity', // Example icon name from DB
      content: `Detailed content for university ${i + 1}`,
    }));
    setData(simulatedData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const startIndex = currentPage * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const currentData = data.slice(startIndex, endIndex);

  const nextPage = () => {
    if (endIndex < data.length) {
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
        {currentData.map((item) => (
          <MasterTableRow key={item.id} item={item} />
        ))}
      </Accordion>
      <Flex justifyContent="space-between" mt="4">
        <Button onClick={prevPage} isDisabled={currentPage === 0}>
          Back
        </Button>
        <Text>
          Page {currentPage + 1} of {Math.ceil(data.length / PAGE_SIZE)}
        </Text>
        <Button onClick={nextPage} isDisabled={endIndex >= data.length}>
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default InfiniteAccordion;
