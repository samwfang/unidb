// ColumnPopover.tsx
import React, { useState } from 'react';
import { Button, Popover, PopoverTrigger, PopoverContent, PopoverBody, Menu, MenuButton, MenuList, MenuItem, Portal } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { ColumnType, getColumnDisplayName } from 'src/helpers/DepartmentHelper';

interface ColumnPopoverProps {
  columnType: ColumnType;
  onNameChange: (newName: string) => void;
}

const ColumnPopover: React.FC<ColumnPopoverProps> = ({ columnType, onNameChange }) => {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant="outline"
          size="sm"
          fontWeight="bold"
          rightIcon={<ChevronDownIcon />}
          bg="transparent"
          borderColor="gray.200"
          _hover={{ bg: 'gray.100' }}
        >
          {getColumnDisplayName(columnType)}
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent>
          <PopoverBody>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                Change Text
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => onNameChange("University Name")}>University Name</MenuItem>
                <MenuItem onClick={() => onNameChange("School Name")}>School Name</MenuItem>
                <MenuItem onClick={() => onNameChange("Institution Name")}>Institution Name</MenuItem>
              </MenuList>
            </Menu>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default ColumnPopover;