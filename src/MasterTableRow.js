// MasterTableRow.js
import React, { forwardRef } from 'react';
import { AccordionItem, AccordionButton, Box, Grid, GridItem, Image } from '@chakra-ui/react';
import MTExpandedEntry from './MTExpandedEntry';

const MasterTableRow = forwardRef(({ item }, ref) => (
  <AccordionItem ref={ref}>
    <AccordionButton>
      <Grid templateColumns="50px 1fr 1fr 1fr 1fr" gap={4} w="full" alignItems="center">
        {/* Logo for University */}
      <GridItem>
            <Image
              src={`/logos/${item.icon}`} // Adjust the path based on where you store your images
              alt={`${item.name} logo`}
              boxSize="40px"
              objectFit="contain"
            />
        </GridItem>

        {/* University Name */}
        <GridItem>
          <Box flex="1" textAlign="left">
            {item.name}
          </Box>
        </GridItem>

        {/* Other Columns */}
        <GridItem>{item.location}</GridItem>
        <GridItem>{item.studentFacultyRatio}</GridItem>
        <GridItem>{item.otherColumn}</GridItem>
      </Grid>
    </AccordionButton>

    {/* This is the Expanded Entry, what you see when the user clicks each entry in the table*/}
    <MTExpandedEntry content={item.content} />
  </AccordionItem>
));

export default MasterTableRow;
