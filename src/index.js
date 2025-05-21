import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter as Router} from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react'; 
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/300.css";
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