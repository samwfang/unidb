import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import MasterTable from './MasterTable'
import TopHeader from './components/TopHeader';
import UGradGradToggle from './UGradGradToggle';
import { MTControlPanel } from './MTControlPanel';
import FrontPageInfo from './FrontPageInfo';
import {
  Box,
  Image,
  Badge,
  Text,
  Icon,
  Stack,
  Avatar,
  AvatarBadge,
  Alert,
  AlertTitle,
  AlertDescription,
  FormLabel,
  Input,
  FormHelperText,
  FormErrorMessage,
  Grid,
  Switch,
  InputGroup,
  InputRightElement,
  Flex,
  Tag,
  Heading,
  Select
} from '@chakra-ui/react'
import {
  StarIcon,
  EmailIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@chakra-ui/icons'
import ThankYouPage from './ThankYouPage';


export enum ModeType {
  Undergrad = 'undergrad',
  Grad = 'grad',
  Law = 'law'
}


function App() {

  // whether table will prioritize undergraduate or graduate information
  const [mode, setMode] = useState<ModeType>(ModeType.Undergrad);
  // number of entries mastertable shows
  const [pageSize, setPageSize] = useState<number>(10);
  //set whether to show the top header or not
  const [showHeader, setShowHeader] = useState<boolean>(false);
  const frontPageInfoRef = useRef<HTMLDivElement>(null);

  //handle showing or removing the front header based on user scroll location
  useEffect(() => {
    const handleScroll = () => {
      if (frontPageInfoRef.current) {
        // Show header after scrolling past 50% of FrontPageInfo height
        const threshold = frontPageInfoRef.current.offsetHeight * 0.1;
        setShowHeader(window.scrollY > threshold);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const undergradGradToggle = () => {
    setMode((prevMode) => (prevMode === ModeType.Undergrad ? ModeType.Grad : ModeType.Undergrad));
    console.log(mode)
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(e.target.value, 10));
  };

  return (
    <div className="App">
      {/* Gradient Background to make it look nice and spiffy! */}
      <Box minH="100vh"
      height="100%"
      position="relative"
      overflow="hidden"
        bgGradient={mode === ModeType.Undergrad ? "linear(to-br, blue.50, blue.100)" : "linear(to-br, gray.50, gray.200)"} // Chakra's gradient syntax
         p={{ base: 2, md: 4 }}
      >
        {/* Top Header: Only Display when ShowHeader == True */}
        <TopHeader 
          mode={mode} 
          showHeader={showHeader} 
          onToggle={undergradGradToggle} 
        />

        <Flex maxW="1000px" 
          w="100%" // Ensure it takes full width on mobile
          px={{ base: 2, md: 0 }} // Add padding on mobile
          alignItems="center" 
          mx="auto" 
          ref={frontPageInfoRef}>
          <FrontPageInfo mode={mode} onModeChange={undergradGradToggle}/>
        </Flex>
        {/* Master Table and Control Panel */}
        <Flex direction={{ base: "column", md: "row" }} gap={2} mt={6} maxW="1300px" mx="auto" w="100%"
          px={{ base: 2, md: 0 }}>
          <MTControlPanel
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            mode={mode}
            onModeChange={undergradGradToggle}
          />

          {/* MasterTable - updated to use pageSize prop */}
          <Box flex={1}  w="100%" overflowX="auto">
            <MasterTable mode={mode} toggleMode={undergradGradToggle} pageSize={pageSize} />
          </Box>
        </Flex>
        <Flex maxW="1000px" alignItems="center"  mx="auto" ref={frontPageInfoRef}>
          <ThankYouPage mode={mode} onModeChange={undergradGradToggle}/>
        </Flex>
        <Box mt="auto" py={4} textAlign="center" color="gray.600">
          <Text fontSize="sm">
            By Samuel Fang | Built with React & Chakra UI
          </Text>
        </Box>
      </Box>
    </div>
  );
}

export default App;
