import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './Root/App'
import { ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/200.css";
import "@fontsource/poppins/100.css";
import "@fontsource/poppins/600.css";

const theme = extendTheme({
  fonts: {
    heading: `'Poppins', sans-serif`,
    body: `'Poppins', sans-serif`,
  },
  fontWeights: {
    normal: 200,
    medium: 400,
    bold: 600,
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  components: {
    // Default Box Design 
    Box: {
        glassBorder: (props) => ({
          bg: props.colorMode === 'dark' ? 'rgba(26, 32, 44, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
          borderRadius: 'lg',
          boxShadow: props.colorMode === 'dark'
            ? '0 4px 30px rgba(0, 0, 0, 0.3)'
            : '0 4px 30px rgba(0, 0, 0, 0.1)',
        }),
    },
    Button: {
      variants: {
        primary: (props) => ({
          bg: props.colorMode === 'dark' ? 'blue.600' : 'blue.500',
          color: 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'blue.700' : 'blue.600',
          },
        }),
        secondary: (props) => ({
          bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.600',
          color: 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.700',
          },
        }),
      },
    },
    Input: {
      baseStyle: (props) => ({
        field: {
          bg: props.colorMode === 'dark' ? 'rgba(45, 55, 72, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
          _hover: {
            borderColor: props.colorMode === 'dark' ? 'blue.500' : 'blue.400',
          },
          _focus: {
            borderColor: props.colorMode === 'dark' ? 'blue.500' : 'blue.500',
            bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          },
        },
      }),
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <ChakraProvider theme={theme} resetCSS>
        {/*<ColorModeScript initialColorMode={theme.config.initialColorMode} />*/}
        <App />
      </ChakraProvider>
    </Router>
  </StrictMode>,
)