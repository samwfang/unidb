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
    normal: 300,
    medium: 400,
    bold: 600,
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#0f1117' : '#f8fafc',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.700',
        lineHeight: 'tall',
      },
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: props.colorMode === 'dark' ? 'gray.700 transparent' : 'gray.300 transparent',
      },
    }),
  },
  colors: {
    brand: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '500',
        borderRadius: 'lg',
        letterSpacing: 'tight',
      },
      variants: {
        primary: (props) => ({
          bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.500',
          color: 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.700' : 'brand.600',
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          },
          _active: {
            transform: 'translateY(0)',
          },
          transition: 'all 0.15s ease',
        }),
        secondary: (props) => ({
          bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
          color: props.colorMode === 'dark' ? 'gray.200' : 'gray.700',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
          _hover: {
            bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          },
          _active: {
            transform: 'translateY(0)',
          },
          transition: 'all 0.15s ease',
        }),
        ghost: (props) => ({
          bg: 'transparent',
          color: props.colorMode === 'dark' ? 'gray.300' : 'gray.600',
          _hover: {
            bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50',
          },
        }),
      },
    },
    Input: {
      baseStyle: (props) => ({
        field: {
          bg: props.colorMode === 'dark' ? 'whiteAlpha.50' : 'white',
          borderColor: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'gray.200',
          _hover: {
            borderColor: props.colorMode === 'dark' ? 'whiteAlpha.200' : 'gray.300',
          },
          _focus: {
            borderColor: 'brand.400',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)',
          },
        },
      }),
    },
    Tabs: {
      variants: {
        'soft-rounded': (props) => ({
          tab: {
            borderRadius: 'full',
            fontWeight: '500',
            fontSize: 'sm',
            color: props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
            _selected: {
              color: 'white',
              bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.500',
            },
            _hover: {
              color: props.colorMode === 'dark' ? 'gray.200' : 'gray.700',
              bg: props.colorMode === 'dark' ? 'whiteAlpha.100' : 'blackAlpha.50',
            },
            transition: 'all 0.15s ease',
          },
        }),
      },
    },
    Accordion: {
      baseStyle: (props) => ({
        container: {
          border: 'none',
        },
      }),
    },
    Spinner: {
      baseStyle: (props) => ({
        color: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
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