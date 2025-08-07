# Components Directory

## Overview

Reusable React components and UI elements used throughout the Poker Connect Hub application. Built with accessibility and performance in mind.

## Core Components

### CardInput (`/CardInput.tsx`)

**Smart poker card input component** with:

- Auto-completion for card values
- Validation (no duplicates)
- Keyboard navigation
- Visual card preview
- Support for multiple cards

Key features:

- Parses shorthand (e.g., "As" → Ace of Spades)
- Excludes already selected cards
- Responsive design
- Clear visual feedback

### Card Suggestions (`/card-input/CardSuggestions.tsx`)

Dropdown suggestion list for card input:

- Filters based on input
- Keyboard accessible
- Click to select
- Shows card visuals

### UI Components (`/ui/`)

Shadcn/ui based component library:

#### Core Elements

- **Button** - Styled button with variants
- **Input** - Form input with validation states
- **Label** - Accessible form labels
- **Badge** - Status/tag display
- **Card** - Content containers
- **Dialog** - Modal dialogs
- **Select** - Dropdown selections
- **Textarea** - Multi-line input

#### Playing Cards

- **playing-card.tsx** - Visual card representation
- SVG-based rendering
- All 52 cards + back
- Responsive sizing

#### Form Components

- **form.tsx** - React Hook Form integration
- Field validation
- Error messages
- Accessible markup

#### Layout Components

- **aspect-ratio** - Maintain proportions
- **separator** - Visual dividers
- **skeleton** - Loading states
- **tabs** - Tab navigation

## Design System

### Styling Approach

- Tailwind CSS utilities
- CSS-in-JS via class variance authority
- Dark mode support
- Consistent spacing/colors

### Component Patterns

```typescript
// Variant-based styling
const buttonVariants = cva('base-classes', {
  variants: {
    variant: {
      default: 'default-classes',
      destructive: 'destructive-classes',
    },
    size: {
      default: 'h-10 px-4',
      sm: 'h-9 px-3',
    },
  },
});
```

### Accessibility

- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

## Integration Examples

### Card Input Usage

```typescript
<CardInput
  label="Hole Cards"
  cards={holeCards}
  onCardsChange={setHoleCards}
  maxCards={2}
  excludeCards={communityCards}
/>
```

### Button Usage

```typescript
<Button
  variant="default"
  size="lg"
  onClick={handleSubmit}
  disabled={!isValid}
>
  Submit Hand
</Button>
```

### Dialog Usage

```typescript
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Select Action</DialogTitle>
    </DialogHeader>
    {/* Dialog body */}
  </DialogContent>
</Dialog>
```

## Performance Considerations

### Memoization

- Components wrapped in `React.memo`
- Prevents unnecessary re-renders
- Custom comparison functions

### Code Splitting

- Heavy components lazy loaded
- Reduces initial bundle size
- Better performance

### Optimized Rendering

- Virtual lists for large datasets
- Debounced inputs
- Throttled updates

## Testing

### Component Testing

- Unit tests with React Testing Library
- Accessibility tests
- Visual regression tests
- Interaction tests

### Storybook Integration

- Component documentation
- Visual testing
- Interactive playground
- Design system showcase
