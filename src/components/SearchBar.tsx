import { Input, Button, Flex, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
  return (
    <Flex flex="1" maxWidth="600px" mr={4}>
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          height="100%"
          pl={3}
          color="gray.500"
        >
          <SearchIcon />
        </InputLeftElement>
        <Input
          placeholder={placeholder}
          flex="1"
          borderColor="gray.300"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          height="48px"
          borderRadius="full"
          paddingX={6}
          paddingLeft={12} // Add extra padding to accommodate the icon
          fontSize="lg"
          bg="rgba(255, 255, 255, 0.43)"
          borderWidth="1px"
          _hover={{
            borderColor: "blue.400",
            boxShadow: "0 0 0 1px blue.400"
          }}
          _focus={{
            borderColor: "blue.500",
            boxShadow: "0 0 0 2px blue.500",
            bg: "white"
          }}
        />
      </InputGroup>
    </Flex>
  );
}