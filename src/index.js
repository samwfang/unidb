import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter as Router} from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react'; 
import "@fontsource/poppins";

const theme = extendTheme({
  fonts: {
    heading: `'Poppins', sans-serif`,
    body: `'Poppins', sans-serif`,
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