import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useColorMode, useColorModeValue } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';
import TopHeader from '../ReusableComponents/TopHeader';
import NavigationFooter from '../ReusableComponents/NavigationFooter';
import ExplorePage from './Pages/ExplorePage';
import FavoritesPage from './Pages/FavoritesPage';
import UniChatPage from './Pages/UniChatPage';
import FacultyDBPage from './Pages/FacultyDBPage';
import AboutPage from './Pages/AboutPage';
import { ModeType } from '../helpers/types';

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [mode, setMode] = useState<ModeType>(ModeType.Undergrad);
  const [showHeader, setShowHeader] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowHeader(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const undergradGradToggle = () => {
    setMode((prevMode) => (prevMode === ModeType.Undergrad ? ModeType.Grad : ModeType.Undergrad));
  };

  const bgGradient = useColorModeValue(
    mode === ModeType.Undergrad
      ? "linear(160deg, #f0f7ff 0%, #e8f0fe 30%, #f8fafc 70%, #f0f4ff 100%)"
      : "linear(160deg, #f5f3ff 0%, #ede9fe 30%, #f8fafc 70%, #faf5ff 100%)",
    mode === ModeType.Undergrad
      ? "linear(160deg, #0a0e1a 0%, #0d1225 40%, #0f1117 70%, #111827 100%)"
      : "linear(160deg, #0f0a1a 0%, #120d25 40%, #0f1117 70%, #1a1025 100%)"
  );

  return (
    <div className="App">
      <Box
        minH="100vh"
        height="100%"
        position="relative"
        overflow="clip"
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

        <Routes>
          <Route
            path="/"
            element={
              <ExplorePage
                mode={mode}
                onModeChange={undergradGradToggle}
              />
            }
          />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/chat" element={<UniChatPage />} />
          <Route path="/facultydb" element={<FacultyDBPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>

        <NavigationFooter mode={mode} />
      </Box>
    </div>
  );
}

export default App;
