// ColumnPopover.tsx
import React, { useState } from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent, PopoverBody, Menu, MenuButton, MenuList, MenuItem, Portal, Text, FormControl, Box } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { CIP_TO_CLASSIFICATION, ColumnType, ExtraSortType, SortType, getColumnDescription, getColumnDisplayName, cipToClassificationName } from 'src/helpers/DepartmentHelper';
import ReactSelect from 'react-select';


interface ColumnPopoverProps {
    departmentName: string | null,
    columnType: ColumnType;
    onNameChange: (newName: string) => void;
    onApply: (sortOption: string) => void;
}

const ColumnPopover: React.FC<ColumnPopoverProps> = ({ departmentName, columnType, onNameChange , onApply }) => {

    const [sortOption, setSortOption] = useState<string>("greatest"); 
    const [modifiedContent, setModifiedContent] = useState<boolean>(false);

    // Generate classification options from CIP_TO_CLASSIFICATION
    const classificationOptions = Object.entries(CIP_TO_CLASSIFICATION).map(([cipCode, name]) => ({
        value: cipCode,
        label: name
    }));


    if (!departmentName) {
        departmentName = "General";
    }

    const handleApply = () => {
        onApply(sortOption); // Forward to parent
    };


    return (
        <Popover onClose={() => {setModifiedContent(false)}}>
            {({ isOpen }) => (
                <>
                    <PopoverTrigger>
                        <Box position="relative">
                            {departmentName && (
                                <Text
                                    fontSize="xs"
                                    fontWeight="semibold"
                                    color={departmentName == "General" ? "gray.600" : "white"}
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
                            <PopoverBody p={4}>
                                <Text fontSize="xl" fontWeight="bold"> {getColumnDisplayName(columnType)}</Text>
                                <Text> {getColumnDescription(columnType)} </Text>
                                <Text fontWeight="bold" mt={2}> Change Column Display: </Text>
                                {isOpen && (
                                    <Box position="relative" border="1px solid" borderColor="gray.200" borderRadius="lg" p={4}>
                                        <Text fontWeight="bold"> Select Department: </Text>
                                        <Popover>
                                            <PopoverTrigger>
                                                <Button
                                                    width="100%"
                                                    justifyContent="flex-start"
                                                    textAlign="left"
                                                    whiteSpace="normal"
                                                    height="auto"
                                                    minHeight="40px"
                                                    py={2}
                                                    fontSize="xs"
                                                    fontWeight="semibold"
                                                    color={departmentName == "General" ? "gray.600" : "white"}
                                                    bg={departmentName == "General" ? "gray.100" : "purple.500"}
                                                    borderRadius="md"
                                                    mb={1}
                                                    border="1px solid"
                                                    borderColor="gray.200"
                                                >
                                                    {departmentName}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent bg="gray.100" border="1px solid" borderColor="purple" borderRadius="lg"
                            boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)" width="400px">
                                                <PopoverBody>
                                                    <Text fontWeight="bold"> Select Field: </Text>
                                                    <FormControl mt={2}>
                                                        <ReactSelect
                                                            options={[

                                                                { value: "general", label: 'General' },
                                                                ...classificationOptions
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
                                                </PopoverBody>
                                            </PopoverContent>
                                        </Popover>
                                        <Text fontWeight="bold"> Sort By: </Text>
                                        <FormControl mt={2}>
                                            <ReactSelect
                                                options={[
                                                    { value: "greatest", label: 'High to Low' },
                                                    { value: "least", label: 'Low to High' }
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
                                                onChange={(selected) => {
                                                    setSortOption(selected?.value || "greatest")
                                                    setModifiedContent(true)}}
                                            />
                                        </FormControl>
                                    </Box>
                                )}

                                <Box display="flex" gap={2} mt={4}>
                                    <Button
                                        flex={1}
                                        colorScheme="blue"
                                        size="sm"
                                    >
                                        {modifiedContent ? "Apply and Sort By" : "Sort By Current"}
                                    </Button>
                                    <Button
                                        flex={1}
                                        colorScheme="green"
                                        size="sm"
                                        disabled={modifiedContent ? false : true}
                                        onClick={handleApply}
                                    >
                                        Apply
                                    </Button>
                                </Box>

                            </PopoverBody>
                        </PopoverContent>
                    </Portal>
                </>
            )}
        </Popover>
    );
};

export default ColumnPopover;