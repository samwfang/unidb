// MTExpandedEntry.js
import React from 'react';
import { AccordionPanel } from '@chakra-ui/react';

const MTExpandedEntry = ({ content }) => {
  return <AccordionPanel pb={4}>{content}</AccordionPanel>;
};

export default MTExpandedEntry;
