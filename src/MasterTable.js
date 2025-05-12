import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Spinner,
  Text,
} from '@chakra-ui/react';

const MasterTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  // Simulate fetching data
  const fetchData = () => {
    setLoading(true);
    setTimeout(() => {
      const newData = Array.from({ length: 10 }, (_, i) => ({
        id: data.length + i + 1,
        title: `Item ${data.length + i + 1}`,
        content: `Content for item ${data.length + i + 1}`,
      }));
      setData((prevData) => [...prevData, ...newData]);
      setHasMore(data.length + newData.length < 100); // Simulate a limit of 100 items
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const lastDataElementRef = useRef();

  useEffect(() => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        fetchData();
      }
    });
    if (lastDataElementRef.current) {
      observer.current.observe(lastDataElementRef.current);
    }
  }, [loading, hasMore]);

  return (
    <Box maxW="600px" mx="auto" mt="8">
      <Accordion allowToggle>
        {data.map((item, index) => (
          <AccordionItem key={item.id} ref={index === data.length - 1 ? lastDataElementRef : null}>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                {item.title}
              </Box>
            </AccordionButton>
            <AccordionPanel pb={4}>{item.content}</AccordionPanel>
          </AccordionItem>
        ))}
        {loading && (
          <Box textAlign="center" p="4">
            <Spinner />
          </Box>
        )}
        {!hasMore && !loading && (
          <Box textAlign="center" p="4">
            <Text>No more data</Text>
          </Box>
        )}
      </Accordion>
    </Box>
  );
};

export default MasterTable;