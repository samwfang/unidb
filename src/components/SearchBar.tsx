import { Input, Button, Flex } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
  return (
    <Flex flex="1" maxWidth="600px" mr={4}>
      <Input
        placeholder={placeholder}
        flex="1"
        borderColor="gray.300"
        _hover={{ borderColor: "gray.300" }}
        _focus={{ borderColor: "blue.400", boxShadow: "outline" }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Button ml={2} colorScheme="blue" px={4}>
        <SearchIcon />
      </Button>
    </Flex>
  );
}