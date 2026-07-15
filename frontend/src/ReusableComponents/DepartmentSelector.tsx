import React, { useEffect, useState } from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent, PopoverBody, Menu, MenuButton, MenuList, MenuItem, Portal, Text, FormControl, Box, Divider } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { CIP_TO_CLASSIFICATION, ColumnType, ExtraSortType, SortType, getColumnDescription, getColumnDisplayName, cipToClassificationName } from 'src/helpers/DepartmentHelper';
import ReactSelect from 'react-select';
import { Spinner } from '@chakra-ui/react';



interface DepartmentSelectorProps {
    departmentName: string | null,
    onDepartmentChange: (newCID: string, newName: string) => void;
    isSelectOpen: boolean;
    setIsSelectOpen: (isOpen: boolean) => void;
}

const fieldSelectStyles = {
    control: (base: any) => ({
        ...base,
        backgroundColor: 'gray.100',
        borderColor: 'gray.300',
        borderRadius: 'md',
        boxShadow: 'sm',
        minHeight: '40px',
        '&:hover': {
            borderColor: 'gray.400'
        }
    }),
    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected ? 'orange.100' : 'white',
        color: 'gray.800',
        '&:hover': {
            backgroundColor: 'gray.100'
        }
    }),
    singleValue: (base: any) => ({
        ...base,
        color: 'gray.800'
    }),
    placeholder: (base: any) => ({
        ...base,
        color: 'gray.500'
    }),
};

const deptSelectStyles = {
    control: (base: any) => ({
        ...base,
        backgroundColor: 'gray.100',
        borderColor: 'gray.300',
        borderRadius: 'md',
        boxShadow: 'sm',
        minHeight: '40px',
        '&:hover': {
            borderColor: 'gray.400'
        }
    }),
    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected ? 'purple.100' : 'white',
        color: 'gray.800',
        '&:hover': {
            backgroundColor: 'gray.100'
        }
    }),
    singleValue: (base: any) => ({
        ...base,
        color: 'gray.800'
    }),
    placeholder: (base: any) => ({
        ...base,
        color: 'gray.500'
    }),
};

export const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ departmentName, onDepartmentChange, isSelectOpen, setIsSelectOpen }) => {
    const [selectedField, setSelectedField] = useState<string | null>(null);
    const [departmentOptions, setDepartmentOptions] = useState<{ value: string, label: string }[]>([]);
    const [selectedDept, setSelectedDept] = useState<{ value: string, label: string }>({ value: "", label: "" });
    const [isLoading, setIsLoading] = useState(false);

    const [allowSubmit, setAllowSubmit] = useState(false);
    const initialFocusRef = React.useRef<HTMLButtonElement>(null);

    const fieldSelectRef = React.useRef<any>(null);
    const deptSelectRef = React.useRef<any>(null);


    // Generate classification options from CIP_TO_CLASSIFICATION
    const classificationOptions = Object.entries(CIP_TO_CLASSIFICATION).map(([cipCode, name]) => ({
        value: cipCode,
        label: name
    }));

    useEffect(() => {
        setSelectedField(null);
    }, []);

    const handleReset = () => {
        setSelectedField(null);
        setSelectedDept({ value: "general", label: "General" });
        setAllowSubmit(true);

        if (fieldSelectRef.current) {
            fieldSelectRef.current.setValue({ value: "general", label: "General" });
        }
    };

    //change field selection depending on which option is selected, and fetch departments from that field
    const handleFieldChange = async (selectedOption: any) => {
        if (selectedOption.value === "general") {
            setSelectedDept({ value: "general", label: "General" });
            setAllowSubmit(true);
            setSelectedField(null);
            return;
        } else {
            setAllowSubmit(false);
        }

        setSelectedField(selectedOption.value);
        setIsLoading(true);

        const departments = await fetchDepartmentsByField(selectedOption.value);
        setDepartmentOptions(departments);
        setIsLoading(false);
    };

    //send selected department over to the parent function
    const handleDepartmentChange = (selectedOption: any) => {
        setSelectedDept(selectedOption);
        setAllowSubmit(true);
    };

    const handleApply = () => {
        if (selectedDept) {
            onDepartmentChange(selectedDept.value, selectedDept.label);
        }
        else {
            onDepartmentChange("General", "General");
        }
        setAllowSubmit(false);
    }

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

        <Popover initialFocusRef={initialFocusRef} closeOnBlur={!isSelectOpen}>
            {({ isOpen, onClose }) => (
                <>
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
                    <PopoverContent zIndex="popover" bg="gray.100" borderRadius="lg"
                        boxShadow="0 4px 30px rgba(0, 0, 0, 0.1)" width={{ base: "calc(100vw - 32px)", md: "350px" }} maxWidth="350px" border="none">
                        <PopoverBody>
                            {isOpen && (
                                <Box m={4}>
                                    <FormControl mt={2}>
                                        <ReactSelect ref={fieldSelectRef}
                                            options={[

                                                { value: "general", label: 'General' },
                                                ...classificationOptions
                                            ]}
                                            onChange={handleFieldChange}
                                            placeholder="Select Field"
                                            styles={{
                                                ...deptSelectStyles,
                                                menu: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                    position: 'absolute'
                                                })
                                            }}
                                            onMenuOpen={() => setIsSelectOpen(true)}
                                            onMenuClose={() => setIsSelectOpen(false)}
                                        />
                                    </FormControl>
                                    {selectedField && (
                                        <Box mt={3}>
                                            <Divider my={4} borderColor="gray.300" />
                                            {isLoading ? (
                                                <Box textAlign="center" py={4}>
                                                    <Spinner
                                                        color="purple.500"
                                                        size="lg"
                                                        thickness="3px"
                                                        speed="0.65s"
                                                    />
                                                </Box>
                                            ) : (
                                                <ReactSelect ref={deptSelectRef}
                                                    options={departmentOptions}
                                                    onChange={handleDepartmentChange}
                                                    placeholder="Select Department"
                                                    styles={{
                                                        ...deptSelectStyles,
                                                        menu: (base) => ({
                                                            ...base,
                                                            zIndex: 9999,
                                                            position: 'absolute'
                                                        })
                                                    }}
                                                    onMenuOpen={() => setIsSelectOpen(true)}
                                                    onMenuClose={() => setIsSelectOpen(false)}
                                                />
                                            )}
                                        </Box>

                                    )}
                                    <Box display="flex" gap={2} mt={4}>
                                        <Button
                                            flex={1}
                                            colorScheme="blue"
                                            size="sm"
                                            onClick={handleReset}
                                        >
                                            Reset
                                        </Button>
                                        <Button
                                            flex={1}
                                            colorScheme="green"
                                            size="sm"
                                            disabled={!allowSubmit}
                                            onClick={() => {
                                                handleApply();
                                                onClose();
                                            }}
                                        >
                                            Update
                                        </Button>
                                    </Box>
                                </Box>
                            )}


                        </PopoverBody>
                    </PopoverContent>
                </>
            )}

        </Popover>



    );

}

export default DepartmentSelector;