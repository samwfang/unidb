// ColumnPopover.tsx
import React, { useState } from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent, PopoverBody, Menu, MenuButton, MenuList, MenuItem, Portal, Text, FormControl, Box} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { ColumnType, ExtraSortType, SortType, getColumnDisplayName } from 'src/helpers/DepartmentHelper';
import ReactSelect from 'react-select';


interface ColumnPopoverProps {
    departmentName: string | null,
    columnType: ColumnType;
    onNameChange: (newName: string) => void;
}

const ColumnPopover: React.FC<ColumnPopoverProps> = ({ departmentName, columnType, onNameChange }) => {

    if (!departmentName){
        departmentName = "General";
    }
    return (
        <Popover>
            {({ isOpen }) => (
                <>
                    <PopoverTrigger>
                        <Box position="relative">
                            {departmentName && (
                                <Text 
                                    fontSize="xs" 
                                    fontWeight="semibold" 
                                    color= {departmentName == "General" ? "gray.600" : "white"}
                                    bg={departmentName == "General" ? "gray.100" : "purple.500"}
                                    px={2}
                                    py={1}
                                    borderRadius="md"
                                    mb={1}
                                    border="1px solid"
                                    borderColor="gray.200"
                                    zIndex={isOpen ? "popover" : "auto"}
                                    position="relative"
                                >
                                    {departmentName}
                                </Text>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                fontWeight="bold"
                                rightIcon={<ChevronDownIcon />}
                                bg={isOpen ? "gray.100" : "transparent"}
                                borderColor="gray.200"
                                _hover={{ bg: 'gray.100' }}
                                zIndex={isOpen ? "popover" : "auto"}
                            >
                                {getColumnDisplayName(columnType)}
                            </Button>
                        </Box>
                    </PopoverTrigger>
                    {isOpen && (
                        <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            backdropFilter="blur(12px)"
                            bg="rgba(0, 0, 0, 0.1)"
                            zIndex="overlay"
                            borderRadius="lg"
                            pointerEvents="none"
                        />
                    )}
                    <Portal>
                        <PopoverContent zIndex="popover" bg="gray.100" borderRadius="lg"
                            boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)">
                            <PopoverBody p={4} >
                                <Text fontSize="xl" fontWeight="bold"> {getColumnDisplayName(columnType)}</Text>
                                <Text fontWeight="bold"> Sort By: </Text>
                                {isOpen && (
                                    <FormControl mt={2}>
                                        <ReactSelect
                                            options={[
                                                { value: ExtraSortType.Alphabetical, label: 'Alphabetical A-Z' },
                                                { value: ExtraSortType.ReverseAlphabetical, label: 'Alphabetical Z-A' }
                                            ]}
                                            placeholder="Select sort option"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    backgroundColor: 'gray.50',
                                                    borderColor: '#E2E8F0',
                                                    _hover: { borderColor: '#CBD5E0' }
                                                }),
                                                option: (base) => ({
                                                    ...base,
                                                    backgroundColor: 'white',
                                                    color: 'black',
                                                    _hover: { backgroundColor: '#F7FAFC' }
                                                })
                                            }}
                                        />
                                    </FormControl>
                                )}
                                <Button
                                    mt={4}
                                    colorScheme="blue"
                                    size="sm"
                                >
                                    Apply Sort
                                </Button>

                            </PopoverBody>
                        </PopoverContent>
                    </Portal>
                </>
            )}
        </Popover>
    );
};

export default ColumnPopover;