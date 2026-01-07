// ColumnPopover.tsx
import React, { useEffect, useState } from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent, PopoverBody, Menu, MenuButton, MenuList, MenuItem, Portal, Text, FormControl, Box, Badge } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { CIP_TO_CLASSIFICATION, ColumnType, ExtraSortType, SortType, getColumnDescription, getColumnDisplayName, cipToClassificationName, canBeDepartmentColumn } from 'src/helpers/DepartmentHelper';
import ReactSelect from 'react-select';
import DepartmentSelector from './DepartmentSelector';
import GlassBox from 'src/containers/GlassBox';
import ColumnPopoverButton from 'src/containers/ColumnPopoverButton';


interface ColumnPopoverProps {
    departmentCID: string;
    departmentName: string,
    columnType: ColumnType;
    onApply: (index: number, newCID: string, newName: string, newColumnType: ColumnType) => void;
    onApplyAndSort: (index: number, newCID: string, newDept: string, newColumnType: ColumnType, sortOption: string) => void;
    index: number;
    sortedByCol: number;
}

const ColumnPopover: React.FC<ColumnPopoverProps> = ({ index, departmentCID, departmentName, columnType, onApply: onApply, onApplyAndSort: onApplyAndSort, sortedByCol }) => {

    const [sortExtraOption, setSortExtraOption] = useState<string>("greatest");
    const [currentField, setCurrentField] = useState<string>("General");
    const [currentCID, setCurrentCID] = useState<string>("general");
    const [currentDept, setCurrentDept] = useState<string>("General");
    const [currentColumnType, setCurrentColumnType] = useState<ColumnType>(columnType);
    const [modifiedContent, setModifiedContent] = useState<boolean>(false);

    const [isSelectOpen, setIsSelectOpen] = useState(false);

    // Generate classification options from CIP_TO_CLASSIFICATION
    const classificationOptions = Object.entries(CIP_TO_CLASSIFICATION).map(([cipCode, name]) => ({
        value: cipCode,
        label: name
    }));

    const isSortedBy: boolean = sortedByCol - 2 === index ? true : false;

    const handlePopoverOpen = () => {
        setCurrentCID(departmentCID || "general");
        setCurrentDept(departmentName || "General");
        setCurrentColumnType(columnType);
        setModifiedContent(false);
    };

    useEffect(() => {
        if (!departmentName || !departmentCID) {
            departmentCID = "general";
            departmentName = "General";
        }

        setCurrentCID("general");
        setCurrentDept(departmentName);
        setCurrentColumnType(columnType);
    }, []);

    //Fallback in case current department changes from General and a non department specific column is selected (e.g. "Location")
    useEffect(() => {
        if (currentDept !== "General" && !canBeDepartmentColumn(currentColumnType)) {
            // Find first valid column type (fallback to first available)
            const firstValidType = columnTypeOptions[0]?.value || ColumnType.TotalStudents;
            setCurrentColumnType(firstValidType);
            setModifiedContent(true);
        }
    }, [currentDept]);

    const handleApply = () => {
        onApply(index, currentCID, currentDept, currentColumnType);
    };

    const handleApplyAndSort = () => {
        if (modifiedContent) {
            onApplyAndSort(index, currentCID, currentDept, currentColumnType, sortExtraOption); // Forward to parent
        }
        else {
            onApplyAndSort(index, departmentCID, departmentName, columnType, sortExtraOption);
        }

    };

    const handleDepartmentChange = (newCID: string, newName: string) => {
        setModifiedContent(true);
        setCurrentCID(newCID);
        setCurrentDept(newName);
    };

    //Generate options to select Column Type from all allowed column type options
    const columnTypeOptions = Object.values(ColumnType)
        .filter(type => currentDept === "General" || canBeDepartmentColumn(type))
        .map(type => ({
            value: type,
            label: getColumnDisplayName(type)
        }));

    const handleColumnTypeChange = (selectedOption: any) => {
        if (selectedOption) {
            setCurrentColumnType(selectedOption.value);
            setModifiedContent(true);
        }
    };


    return (
        <Popover onOpen={handlePopoverOpen} onClose={() => {
            if (!isSelectOpen) {
                setModifiedContent(false);
            }
        }}
            closeOnBlur={!isSelectOpen} >
            {({ isOpen }) => (
                <>
                    <PopoverTrigger>
                        <Box position="relative" minW={{ base: "70px", md: "80px" }} maxW={{ base: "140px", md: "160px" }} textAlign="center">
                            {departmentName && (
                                <Text
                                    fontSize={{ base: "2xs", md: "xs" }}
                                    fontWeight="semibold"
                                    color={departmentName == "General" ? "gray.600" : "white"}
                                    bg={departmentName == "General" ? "gray.100" : "purple.500"}
                                    px={{ base: 2, md: 3 }}
                                    py={{ base: 0.5, md: 1 }}
                                    borderRadius="md"
                                    mb={1}
                                    border="1px solid"
                                    borderColor="gray.200"
                                    zIndex={isOpen ? "popover" : "auto"}
                                    position="relative"
                                    display="inline-block"
                                    lineHeight="short"
                                >
                                    {departmentName}
                                </Text>
                            )}
                            <ColumnPopoverButton
                                isActivated={isSortedBy}
                                isOpen={isOpen}
                            >
                                {getColumnDisplayName(columnType)}
                            </ColumnPopoverButton>
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
                        <PopoverContent zIndex="popover">
                            <GlassBox>
                                <PopoverBody p={4}>
                                    <Text fontSize="xl" fontWeight="bold"> {getColumnDisplayName(columnType)}</Text>
                                    {isSortedBy &&
                                        <Badge bg="green.200">Currently Sorted By</Badge>
                                    }
                                    <Text color="gray.600"> {getColumnDescription(columnType)} </Text>

                                    {isOpen && (
                                        <Box position="relative" border="1px solid" borderColor="gray.200" borderRadius="lg" p={4}>
                                            <Text color="gray.600"> Select Department: </Text>
                                            <Box position="relative" zIndex="popover">
                                                <DepartmentSelector departmentName={currentDept} onDepartmentChange={handleDepartmentChange} isSelectOpen={isSelectOpen}
                                                    setIsSelectOpen={setIsSelectOpen} />
                                            </Box>
                                            <Text color="gray.600" mt={2}>Column Type:</Text>
                                            <ReactSelect
                                                onMenuOpen={() => setIsSelectOpen(true)}
                                                onMenuClose={() => setIsSelectOpen(false)}
                                                options={columnTypeOptions}
                                                value={{ value: currentColumnType, label: getColumnDisplayName(currentColumnType) }}
                                                onChange={handleColumnTypeChange}
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
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        zIndex: 9999 // Ensure dropdown appears above everything
                                                    })
                                                }}
                                            />
                                            <Text fontSize="sm" color="gray.600" mb={4}>
                                                {getColumnDescription(currentColumnType)}
                                            </Text>
                                            <Text color="gray.600" mt={2}>Sort From:</Text>
                                            <FormControl>
                                                <ReactSelect
                                                    options={[
                                                        { value: "greatest", label: 'High to Low' },
                                                        { value: "least", label: 'Low to High' }
                                                    ]}
                                                    defaultValue={{ value: "greatest", label: 'High to Low' }}
                                                    placeholder="Select sort option"
                                                    onMenuOpen={() => setIsSelectOpen(true)}
                                                    onMenuClose={() => setIsSelectOpen(false)}
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
                                                        }),
                                                        menu: (base) => ({
                                                            ...base,
                                                            zIndex: 9999 // Ensure dropdown appears above everything
                                                        })
                                                    }}
                                                    onChange={(selected) => {
                                                        setSortExtraOption(selected?.value || "greatest")
                                                        setModifiedContent(true)
                                                    }}

                                                />
                                            </FormControl>
                                        </Box>
                                    )}

                                    <Box display="flex" gap={2} mt={4}>
                                        <Button
                                            flex={1}
                                            variant="primary"
                                            size="sm"
                                            zIndex="overlay"
                                            onClick={handleApplyAndSort}
                                        >
                                            {modifiedContent ? "Apply and Sort By" : "Sort By Column"}
                                        </Button>
                                        <Button
                                            flex={1}
                                            colorScheme="green"
                                            size="sm"
                                            disabled={modifiedContent ? false : true}
                                            onClick={handleApply}
                                            zIndex="overlay"
                                        >
                                            Apply
                                        </Button>
                                    </Box>

                                </PopoverBody>
                            </GlassBox>
                        </PopoverContent>
                    </Portal>
                </>
            )}
        </Popover>
    );
};

export default ColumnPopover;