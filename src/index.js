import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeScript } from '@chakra-ui/react'
import { BrowserRouter as Router} from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
    <ChakraProvider resetCSS> 
      {/*<ColorModeScript initialColorMode={theme.config.initialColorMode} />*/}
      <App />
    </ChakraProvider>
    </Router>
  </StrictMode>,
)