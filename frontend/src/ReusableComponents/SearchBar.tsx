import { Input, Flex, InputGroup, InputLeftElement, useColorMode } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Flex flex="1" maxWidth="600px" mr={4}>
      <InputGroup size="lg">
        <InputLeftElement
          pointerEvents="none"
          height="100%"
          pl={4}
          color={isDark ? 'gray.500' : 'gray.400'}
        >
          <SearchIcon boxSize={4} />
        </InputLeftElement>
        <Input
          placeholder={placeholder}
          flex="1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          height="44px"
          borderRadius="xl"
          pl={12}
          pr={4}
          fontSize="sm"
          fontWeight="400"
          bg={isDark ? 'rgba(255, 255, 255, 0.05)' : 'white'}
          border="1px solid"
          borderColor={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}
          _hover={{
            borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'gray.300',
          }}
          _focus={{
            borderColor: 'brand.400',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.12)',
            bg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'white',
          }}
          transition="all 0.15s ease"
        />
      </InputGroup>
    </Flex>
  );
}
