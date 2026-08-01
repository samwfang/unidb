import React, { useState } from 'react';
import { GridItem, FormControl, Text, Badge, Box, Button, useColorMode } from '@chakra-ui/react';
import { Popover, PopoverTrigger, PopoverContent, Portal } from '@chakra-ui/react';
import ReactSelect, { SingleValue } from 'react-select';
import ColumnPopover from '../../ReusableComponents/ColumnPopover';
import GlassBox from '../../containers/GlassBox';
import ColumnPopoverButton from 'src/containers/ColumnPopoverButton';
import { ColumnType, ExtraSortType } from '../../helpers/DepartmentHelper';
import { DataTableColumn, ColumnHeaderContext } from './DataTable';

//University-specific header columns for the DataTable.
//Score and Name are static (always shown); the rest are state-backed metric
//columns that reuse the shared ColumnPopover (department + metric + sort).

const ScoreColumnHeader: React.FC<ColumnHeaderContext<ColumnType>> = ({ isSorted }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <GridItem textAlign="center">
      <Popover>
        {({ isOpen }) => (
          <>
            <PopoverTrigger>
              <ColumnPopoverButton isActivated={isSorted} isOpen={isOpen}>
                Score
              </ColumnPopoverButton>
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
                borderRadius="xl"
                pointerEvents="none"
              />
            )}
            <Portal>
              <PopoverContent>
                <GlassBox p={4}>
                  <Text fontSize="lg" fontWeight="600">Score</Text>
                  <Badge variant="subtle" colorScheme="pink" ml={1} fontSize="2xs">WIP</Badge>
                  {isSorted && <Badge colorScheme="green" ml={2} fontSize="2xs">Sorted</Badge>}
                  <Text fontSize="sm" mt={2} color={isDark ? 'gray.400' : 'gray.500'}>
                    Custom scoring is currently in progress!
                  </Text>
                </GlassBox>
              </PopoverContent>
            </Portal>
          </>
        )}
      </Popover>
    </GridItem>
  );
};

const NameColumnHeader: React.FC<ColumnHeaderContext<ColumnType>> = ({ index, isSorted, applySort }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const [selectedNameSortingOption, setSelectedNameSortingOption] = useState<SingleValue<{ value: string; label: string }>>(null);

  // Change Preliminary Sorting Option Selected Under the University Name Popup (Hardcoded)
  const onUniversityNameSelectChange = (option: SingleValue<{ value: string; label: string }>) => {
    setSelectedNameSortingOption(option);
  };

  const applyAlphabeticalSort = () => {
    if (selectedNameSortingOption) {
      // Trust that you will always use a valid sort key as the value of a Sort Option
      applySort(index, selectedNameSortingOption.value, 'general', 'greatest');
      console.log('Selected option:', selectedNameSortingOption.value);
    } else {
      console.log('No option selected.');
    }
  };

  return (
    <GridItem textAlign="left">
      <Popover>
        {({ isOpen }) => (
          <>
            <PopoverTrigger>
              <ColumnPopoverButton isActivated={isSorted} isOpen={isOpen} maxWidth="120px">
                Name
              </ColumnPopoverButton>
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
                borderRadius="xl"
                pointerEvents="none"
              />
            )}
            <Portal>
              <PopoverContent zIndex="popover">
                <GlassBox p={4}>
                  <Text fontSize="lg" fontWeight="600">University Name</Text>
                  {isSorted && <Badge colorScheme="green" ml={2} fontSize="2xs">Sorted</Badge>}
                  <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'} mt={1}>
                    The most common name for each university.
                  </Text>
                  <Text fontWeight="600" fontSize="sm" mt={3}>Sort by:</Text>
                  {isOpen && (
                    <FormControl mt={2}>
                      <ReactSelect
                        value={selectedNameSortingOption}
                        options={[
                          { value: ExtraSortType.Alphabetical, label: 'Alphabetical A-Z' },
                          { value: ExtraSortType.ReverseAlphabetical, label: 'Alphabetical Z-A' }
                        ]}
                        placeholder="Select sort option"
                        styles={{
                          control: (base) => ({
                            ...base,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                            borderRadius: '8px',
                            minHeight: '36px',
                          }),
                          option: (base) => ({
                            ...base,
                            backgroundColor: isDark ? '#1a202c' : 'white',
                            color: isDark ? 'white' : 'black',
                            fontSize: '14px',
                          })
                        }}
                        onChange={onUniversityNameSelectChange}
                      />
                    </FormControl>
                  )}
                  <Button mt={3} variant="primary" size="sm" onClick={applyAlphabeticalSort}>
                    Apply Sort
                  </Button>
                </GlassBox>
              </PopoverContent>
            </Portal>
          </>
        )}
      </Popover>
    </GridItem>
  );
};

const DynamicColumnHeader: React.FC<ColumnHeaderContext<ColumnType>> = ({ index, isSorted, state, updateColumnState, applySort }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <GridItem textAlign="center" fontWeight="600" fontSize="sm"
      color={isDark ? 'gray.300' : 'gray.500'}>
      <ColumnPopover
        departmentCID={state?.key ?? 'general'}
        departmentName={state?.label ?? 'General'}
        columnType={state?.value ?? ColumnType.Location}
        onApply={(i, newCID, newName, newColumnType) =>
          updateColumnState(i, { key: newCID, label: newName, value: newColumnType })
        }
        onApplyAndSort={(i, newCID, newDept, newColumnType, sortOption) => {
          updateColumnState(i, { key: newCID, label: newDept, value: newColumnType });
          applySort(i, newColumnType, newCID, sortOption);
        }}
        index={index}
        isSorted={isSorted}
      />
    </GridItem>
  );
};

export const universityColumns: DataTableColumn<ColumnType>[] = [
  {
    id: 'score',
    responsive: false,
    template: { base: '50px', md: '60px' },
    header: ScoreColumnHeader,
  },
  {
    id: 'name',
    responsive: false,
    template: { base: 'minmax(100px, 1fr)', md: '2fr' },
    header: NameColumnHeader,
  },
  {
    id: 'location',
    template: { base: 'minmax(50px, 1fr)', md: '1fr' },
    initial: { key: 'general', label: 'General', value: ColumnType.Location },
    header: DynamicColumnHeader,
  },
  {
    id: 'graduation-rate',
    template: { base: 'minmax(50px, 1fr)', md: '1fr' },
    initial: { key: 'general', label: 'General', value: ColumnType.GraduationRate },
    header: DynamicColumnHeader,
  },
  {
    id: 'total-students',
    template: { base: 'minmax(50px, 1fr)', md: '1fr' },
    initial: { key: 'general', label: 'General', value: ColumnType.TotalStudents },
    header: DynamicColumnHeader,
  },
];
