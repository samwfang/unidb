import React, { useState, useEffect } from 'react';
import { AccordionItem, AccordionButton, Box, Grid, GridItem, Icon, useColorMode } from '@chakra-ui/react';
import MTExpandedEntry from './MTExpandedEntry';
import { UniversityData } from "../../../helpers/types";
import { ModeType } from "../../../helpers/types";
import { ColumnType, getColumnData } from '../../../helpers/DepartmentHelper';
import { DataRowProps } from '../DataTable';
import { useFavorites } from '../../../helpers/FavoritesContext';

type MasterTableRowProps = DataRowProps<UniversityData, ColumnType>;

const MasterTableRow: React.FC<MasterTableRowProps> = ({ rank, item, mode, columnState, toggleMode, onExpand }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(item.id);

  useEffect(() => {
    if (isExpanded) {
      handleExpand();
    }
  }, [mode]);

  const handleExpand = async () => {
    if (!isExpanded) {
      setIsLoading(true);
      try {
        setIsExpanded(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const activeColor = mode === ModeType.Undergrad ? 'brand.500' : 'purple.500';

  return (
    <AccordionItem
      border="none"
      _notFirst={{ mt: '1px' }}
    >
      {({ isExpanded: isAccordionExpanded }) => (
        <>
          <AccordionButton
            onClick={handleExpand}
            borderRadius="lg"
            mx={1}
            my={0.5}
            px={{ base: 2, md: 3 }}
            py={{ base: 2, md: 2.5 }}
            minH={{ base: "44px", md: "52px" }}
            _hover={{
              bg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            }}
            _expanded={{
              bg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
              boxShadow: 'inset 0 0 0 1px',
              insetBoxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.06)' : '0 0 0 1px rgba(0,0,0,0.06)',
            }}
            transition="all 0.15s ease"
          >
            <Grid
              templateColumns={{
                base: `30px minmax(120px, 1fr) ${'minmax(60px, 1fr) '.repeat(columnState.length)} 28px`,
                md: `60px 2fr ${'1fr '.repeat(columnState.length)} 36px`
              }}
              gap={{ base: 2, md: 4 }}
              width="100%"
              alignItems="center"
            >
              {/* Rank */}
              <GridItem textAlign="center">
                <Box
                  fontWeight="600"
                  color={activeColor}
                  fontSize={{ base: "xs", md: "sm" }}
                  opacity={0.8}
                >
                  {rank}
                </Box>
              </GridItem>

              {/* University Name */}
              <GridItem textAlign="left">
                <Box
                  fontWeight="600"
                  fontSize={{ base: "xs", md: "sm" }}
                  color={isDark ? 'gray.100' : 'gray.700'}
                  lineHeight="short"
                  noOfLines={1}
                >
                  {item.name}
                </Box>
              </GridItem>

              {/* Dynamic Columns */}
              {columnState.map((col, index) => (
                <GridItem
                  key={index}
                  textAlign="center"
                  fontSize={{ base: "xs", md: "sm" }}
                  color={isDark ? 'gray.300' : 'gray.600'}
                >
                  {getColumnData(item, col?.value ?? ColumnType.Location, mode, col?.key ?? 'general')}
                </GridItem>
              ))}

              {/* Favorite Toggle */}
              <GridItem textAlign="center">
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label={isFav ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(item);
                    }
                  }}
                  display="inline-flex"
                  cursor="pointer"
                  color={isFav ? 'red.400' : isDark ? 'gray.500' : 'gray.400'}
                  _hover={{ color: 'red.300', transform: 'scale(1.1)' }}
                  transition="all 0.15s ease"
                >
                  <Icon viewBox="0 0 24 24" boxSize={{ base: 3, md: 3.5 }}>
                    <path
                      fill="currentColor"
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    />
                  </Icon>
                </Box>
              </GridItem>
            </Grid>
          </AccordionButton>

          <MTExpandedEntry
            mode={mode}
            item={item}
            rank={rank}
            content={item.content}
            isLoading={isLoading}
            isExpanded={isAccordionExpanded}
          />
        </>
      )}
    </AccordionItem>
  );
};

export default MasterTableRow;
