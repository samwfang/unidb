import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AccordionItem, AccordionButton, Box, Grid, GridItem, Icon, IconProps, Circle, Flex, Text, useColorMode } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { WarningIcon } from '@chakra-ui/icons';
import MTExpandedEntry from './MTExpandedEntry';
import { UniversityData } from "../../../helpers/types";
import { ModeType } from "../../../helpers/types";
import { ColumnType, getColumnData } from '../../../helpers/DepartmentHelper';
import { DataRowProps } from '../DataTable';
import { MAX_FAVORITES, useFavorites, FavoriteToggleResult } from '../../../helpers/FavoritesContext';
import GlassBox from '../../../containers/GlassBox';

type MasterTableRowProps = DataRowProps<UniversityData, ColumnType>;

const slideUp = keyframes`
  from { opacity: 0; transform: translate(-50%, 8px); }
  to { opacity: 1; transform: translate(-50%, 0); }
`;

const HEART_PATH = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

const HeartFilledIcon: React.FC<IconProps> = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d={HEART_PATH} />
  </Icon>
);

const HeartOutlineIcon: React.FC<IconProps> = (props) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="none" stroke="currentColor" strokeWidth="2" d={HEART_PATH} />
  </Icon>
);

const MasterTableRow: React.FC<MasterTableRowProps> = ({ rank, item, mode, columnState, toggleMode, onExpand }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedback, setFeedback] = useState<FavoriteToggleResult | null>(null);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(item.id);

  useEffect(() => {
    if (isExpanded) {
      handleExpand();
    }
  }, [mode]);

  //Auto-dismiss the favorites feedback toast after a short delay.
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFeedback(toggleFavorite(item));
  };

  const handleFavoriteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      setFeedback(toggleFavorite(item));
    }
  };

  const feedbackConfig = feedback
    ? {
        added: { icon: HeartFilledIcon, bg: 'rgba(245, 101, 101, 0.15)', iconColor: 'red.400' },
        removed: { icon: HeartOutlineIcon, bg: 'rgba(160, 174, 192, 0.15)', iconColor: isDark ? 'gray.300' : 'gray.500' },
        limit: { icon: WarningIcon, bg: 'rgba(229, 62, 62, 0.15)', iconColor: 'red.400' },
      }[feedback]
    : null;

  const feedbackMessage =
    feedback === 'added' ? (
      <>Added <Text as="span" fontWeight="700">{item.name}</Text> to favorites ({favorites.length}/{MAX_FAVORITES})</>
    ) : feedback === 'removed' ? (
      <>Removed <Text as="span" fontWeight="700">{item.name}</Text> from favorites</>
    ) : feedback === 'limit' ? (
      <>You've reached the maximum of {MAX_FAVORITES} favorites. Remove one to add another.</>
    ) : null;

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
                base: `30px minmax(120px, 1fr) ${'minmax(60px, 1fr) '.repeat(columnState.length)} 30px`,
                md: `60px 2fr ${'1fr '.repeat(columnState.length)} 38px`
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
                  role="group"
                  position="relative"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="full"
                  overflow="hidden"
                  cursor="pointer"
                  w={{ base: "30px", md: "38px" }}
                  h={{ base: "26px", md: "32px" }}
                  transition="transform 0.15s ease"
                  _hover={{ transform: 'scale(1.1)' }}
                >
                  {/* Pink tab fading in on hover */}
                  <Box
                    position="absolute"
                    right={0}
                    top={0}
                    bottom={0}
                    w="100%"
                    bg="pink.400"
                    zIndex={0}
                    opacity={0}
                    transition="opacity 0.2s ease"
                    _groupHover={{ opacity: 1 }}
                  />
                  <Box
                    role="button"
                    tabIndex={0}
                    aria-label={isFav ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                    onClick={handleFavoriteClick}
                    onKeyDown={handleFavoriteKeyDown}
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    zIndex={1}
                    w="100%"
                    h="100%"
                    color={isFav ? 'red.400' : isDark ? 'gray.500' : 'gray.400'}
                    transition="color 0.2s ease"
                    _groupHover={{ color: 'white' }}
                    _focusVisible={{ boxShadow: `0 0 0 2px ${isDark ? 'rgba(244,114,182,0.6)' : 'rgba(236,72,153,0.5)'}` }}
                  >
                    <Icon viewBox="0 0 24 24" boxSize={{ base: 3, md: 3.5 }}>
                      <path
                        fill="currentColor"
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      />
                    </Icon>
                  </Box>
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

          {/* Favorites feedback toast, portaled to the bottom of the screen above the footer */}
          {feedback && feedbackConfig && createPortal(
            <Box
              position="fixed"
              left="50%"
              bottom="76px"
              transform="translateX(-50%)"
              zIndex={11000}
              animation={`${slideUp} 0.2s ease-out`}
            >
              <GlassBox
                borderRadius="full"
                px={4}
                py={2.5}
                maxW={{ base: '90vw', md: '520px' }}
                boxShadow={isDark ? '0 8px 32px rgba(0,0,0,0.45)' : '0 8px 32px rgba(0,0,0,0.12)'}
              >
                <Flex align="center" gap={2.5} justifyContent="center">
                  <Circle size="26px" bg={feedbackConfig.bg}>
                    <Icon as={feedbackConfig.icon} boxSize={3.5} color={feedbackConfig.iconColor} />
                  </Circle>
                  <Text fontSize="sm" fontWeight="500" color={isDark ? 'gray.100' : 'gray.700'}>
                    {feedbackMessage}
                  </Text>
                </Flex>
              </GlassBox>
            </Box>,
            document.body
          )}
        </>
      )}
    </AccordionItem>
  );
};

export default MasterTableRow;
