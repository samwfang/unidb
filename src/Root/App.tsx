import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import MasterTable from './FrontPage/MasterTable'
import TopHeader from '../ReusableComponents/TopHeader';
import UGradGradToggle from '../ReusableComponents/UGradGradToggle';
import { MTControlPanel } from './FrontPage/MTControlPanel';
import FrontPageInfo from './FrontPage/FrontPageInfo';
import { useColorMode, useColorModeValue } from '@chakra-ui/react';
import NavigationFooter from '../ReusableComponents/NavigationFooter';
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
import ThankYouPage from './FrontPage/ThankYouPage';


export enum ModeType {
  Undergrad = 'undergrad',
  Grad = 'grad',
  Law = 'law'
}


function App() {

  const [activeTab, setActiveTab] = useState<string>('explore');


   const { colorMode, toggleColorMode } = useColorMode(); // Get current color mode
  // whether table will prioritize undergraduate or graduate information
  const [mode, setMode] = useState<ModeType>(ModeType.Undergrad);
  // number of entries mastertable shows
  const [pageSize, setPageSize] = useState<number>(10);
  //set whether to show the top header or not
  const [showHeader, setShowHeader] = useState<boolean>(false);
  const frontPageInfoRef = useRef<HTMLDivElement>(null);


  const masterTableRef = useRef<HTMLDivElement>(null);

  const scrollToMasterTable = () => {
    masterTableRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Use color mode values for backgrounds
  const bgGradient = useColorModeValue(
    mode === ModeType.Undergrad ? "linear(to-br, blue.50, blue.100)" : "linear(to-br, gray.50, gray.200)",
    mode === ModeType.Undergrad ? "linear(to-br, blue.1000, blue.900)" : "linear(to-br, gray.900, gray.800)"
  );

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
        bgGradient={bgGradient} // Chakra's gradient syntax
        p={{ base: 1, md: 4 }}
      >
        {/* Top Header: Only Display when ShowHeader == True */}
        <TopHeader
          mode={mode}
          showHeader={showHeader}
          onToggle={undergradGradToggle}
          onColorModeToggle={toggleColorMode} 
          colorMode={colorMode}
        />

        <Flex maxW="1000px"
          w="100%" // Ensure it takes full width on mobile
          px={{ base: 2, md: 0 }} // Add padding on mobile
          alignItems="center"
          mx="auto"
          ref={frontPageInfoRef}>
          <FrontPageInfo mode={mode}
            onModeChange={undergradGradToggle}
            onFindCollegesClick={scrollToMasterTable} />
        </Flex>
        {/* Master Table and Control Panel */}
        <Box ref={masterTableRef}>
          <Flex direction={{ base: "column", lg: "row" }} gap={2} mt={6} maxW="1300px" mx="auto" w="100%"
            px={{ base: 0, md: 0 }}>
            <MTControlPanel
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              mode={mode}
              onModeChange={undergradGradToggle}
            />

            {/* MasterTable - updated to use pageSize prop */}
            <Box
              flex={1}
              w="100%"
              overflowX="auto"
            >
              <MasterTable mode={mode} toggleMode={undergradGradToggle} pageSize={pageSize} />
            </Box>
          </Flex>
          <Flex maxW="1000px" alignItems="center" mx="auto" ref={frontPageInfoRef}>
            <ThankYouPage mode={mode} onModeChange={undergradGradToggle} />
          </Flex>
        </Box>

        <Box mt="auto" py={4} textAlign="center" color="gray.600">
          <Text fontSize="sm">
            By Samuel Fang | Built with React & Chakra UI
          </Text>
        </Box>

        <NavigationFooter 
            mode={mode} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
      </Box>
    </div>
  );
}

export default App;
