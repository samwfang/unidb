import React, { useState, useEffect, useRef } from 'react';
import MasterTable from './FrontPage/MasterTable'
import TopHeader from '../ReusableComponents/TopHeader';
import { MTControlPanel } from './FrontPage/MTControlPanel';
import FrontPageInfo from './FrontPage/FrontPageInfo';
import { useColorMode, useColorModeValue } from '@chakra-ui/react';
import NavigationFooter from '../ReusableComponents/NavigationFooter';
import { Box, Flex, Text } from '@chakra-ui/react';
import ThankYouPage from './FrontPage/ThankYouPage';
import { ModeType } from '../helpers/types';

function App() {
  const [activeTab, setActiveTab] = useState<string>('explore');
  const { colorMode, toggleColorMode } = useColorMode();
  const [mode, setMode] = useState<ModeType>(ModeType.Undergrad);
  const [pageSize, setPageSize] = useState<number>(10);
  const [showHeader, setShowHeader] = useState<boolean>(false);
  const frontPageInfoRef = useRef<HTMLDivElement>(null);
  const masterTableRef = useRef<HTMLDivElement>(null);

  const scrollToMasterTable = () => {
    masterTableRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const bgGradient = useColorModeValue(
    mode === ModeType.Undergrad
      ? "linear(160deg, #f0f7ff 0%, #e8f0fe 30%, #f8fafc 70%, #f0f4ff 100%)"
      : "linear(160deg, #f5f3ff 0%, #ede9fe 30%, #f8fafc 70%, #faf5ff 100%)",
    mode === ModeType.Undergrad
      ? "linear(160deg, #0a0e1a 0%, #0d1225 40%, #0f1117 70%, #111827 100%)"
      : "linear(160deg, #0f0a1a 0%, #120d25 40%, #0f1117 70%, #1a1025 100%)"
  );

  useEffect(() => {
    const handleScroll = () => {
      if (frontPageInfoRef.current) {
        const threshold = frontPageInfoRef.current.offsetHeight * 0.1;
        setShowHeader(window.scrollY > threshold);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const undergradGradToggle = () => {
    setMode((prevMode) => (prevMode === ModeType.Undergrad ? ModeType.Grad : ModeType.Undergrad));
  };

  return (
    <div className="App">
      <Box
        minH="100vh"
        height="100%"
        position="relative"
        bgGradient={bgGradient}
        pb="80px"
      >
        <TopHeader
          mode={mode}
          showHeader={showHeader}
          onToggle={undergradGradToggle}
          onColorModeToggle={toggleColorMode}
          colorMode={colorMode}
        />

        <Flex
          maxW="1100px"
          w="100%"
          px={{ base: 4, md: 8 }}
          mx="auto"
          ref={frontPageInfoRef}
        >
          <FrontPageInfo
            mode={mode}
            onModeChange={undergradGradToggle}
            onFindCollegesClick={scrollToMasterTable}
          />
        </Flex>

        <Box ref={masterTableRef}>
          <Flex
            direction={{ base: "column", lg: "row" }}
            gap={6}
            mt={8}
            maxW="1300px"
            mx="auto"
            w="100%"
            px={{ base: 4, md: 8 }}
            alignItems="flex-start"
          >
            <MTControlPanel
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              mode={mode}
              onModeChange={undergradGradToggle}
            />

            <Box flex={1} w="100%" minW={0}>
              <MasterTable mode={mode} toggleMode={undergradGradToggle} pageSize={pageSize} />
            </Box>
          </Flex>

          <Flex maxW="1100px" alignItems="center" mx="auto" px={{ base: 4, md: 8 }}>
            <ThankYouPage mode={mode} onModeChange={undergradGradToggle} />
          </Flex>
        </Box>

        <Box mt={12} py={6} textAlign="center">
          <Text fontSize="xs" color="gray.400" fontWeight="400">
            By Samuel Fang · Built with React & Chakra UI
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
