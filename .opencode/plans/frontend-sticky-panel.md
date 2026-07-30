# Frontend: Make left-hand control panel sticky within table area

## Problem
The left-hand control panel (`MTControlPanel`) has `position: sticky` but it doesn't remain visible when scrolling through the table.

## Root Cause
1. `overflowX="hidden"` on the root `<Box>` in `App.tsx` creates a scroll container (per CSS spec, `overflow-x: hidden` + `overflow-y: visible` → `overflow-y` computes to `auto`, making it a scroll container). `position: sticky` anchors to the nearest scroll container, not the viewport, breaking the expected sticky behavior.
2. The panel may not be properly anchored within the flex container.

## Changes

### File 1: `frontend/src/Root/App.tsx` line 56
- **Before**: `overflowX="hidden"`
- **After**: `overflow="clip"`
- **Reason**: `overflow: clip` prevents horizontal overflow without creating a scroll container, so `position: sticky` correctly uses the viewport as its reference.

### File 2: `frontend/src/Root/FrontPage/MTControlPanel.tsx` line 22
- **Before**:
  ```tsx
  position={{ base: "static", lg: "sticky" }}
  top={{ base: "auto", lg: "80px" }}
  ```
- **After**:
  ```tsx
  alignSelf="flex-start"
  position={{ base: "static", lg: "sticky" }}
  top={{ base: "auto", lg: "80px" }}
  ```
- **Reason**: Ensures the panel properly aligns to the top of the flex container even when sticky.

## Expected Behavior
- Scrolling through the table → panel sticks at `top: 80px` (stays visible)
- Scrolling above the table → panel returns to natural flow position (below hero section)
- Scrolling past the table bottom → Flex container scrolls past → panel scrolls away naturally
