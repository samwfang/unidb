import React, { useState } from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent, PopoverBody, Menu, MenuButton, MenuList, MenuItem, Portal, Text, FormControl, Box } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { CIP_TO_CLASSIFICATION, ColumnType, ExtraSortType, SortType, getColumnDescription, getColumnDisplayName, cipToClassificationName } from 'src/helpers/DepartmentHelper';
import ReactSelect from 'react-select';



interface DepartmentSelectorProps {
    departmentName: string | null,
    onNameChange: (newName: string) => void;
}

export const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ departmentName, onNameChange }) => {

    // Generate classification options from CIP_TO_CLASSIFICATION
    const classificationOptions = Object.entries(CIP_TO_CLASSIFICATION).map(([cipCode, name]) => ({
        value: cipCode,
        label: name
    }));

    //fetch Departments through API call which gives a list of all valid departments + CIP codes given a CIP prefix
    const fetchDepartmentsByField = async (cipPrefix: string): Promise<{ value: string, label: string }[]> => {
        try {
            // Simulated API call that handles filtering server-side
            await new Promise(resolve => setTimeout(resolve, 300));

            // Simulated API response (what the server would return)
            const apiResponse = {
                data: [
                    { cip: "1107", name: "Computer Science" },  // Would match "11" prefix
                    { cip: "1107", name: "Engineering" },      // Would match "11" prefix
                    { cip: "0502", name: "Gender Studies" }    // Would match "05" prefix
                ].filter(dept => dept.cip.startsWith(cipPrefix)) // Simulating server-side filter
            };

            return apiResponse.data.map(dept => ({
                value: dept.cip,
                label: dept.name
            }));
        } catch (error) {
            console.error('Failed to fetch departments:', error);
            return [];
        }
    };


    return (

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
                    _hover={{ bg: departmentName == "General" ? "gray.200" : "purple.600" }}
                    as="div"
                    cursor="pointer"
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



    );

}

export default DepartmentSelector;