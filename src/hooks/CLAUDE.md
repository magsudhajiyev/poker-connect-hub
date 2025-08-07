# Hooks Directory

## Overview

Custom React hooks encapsulating business logic and providing reusable functionality across the Poker Connect Hub application.

## Core Hooks

### useShareHandLogic.ts

**Main orchestrator for the hand sharing workflow**

Key responsibilities:

- Multi-step form state management
- Form validation
- Navigation between steps
- Data persistence
- Submission handling

Features:

```typescript
const { formData, setFormData, currentStep, nextStep, prevStep, handleSubmit, isValid } =
  useShareHandLogic();
```

### usePlayerManagement.ts

**Manages player CRUD operations**

Functionality:

- Add/remove players
- Update player details
- Position management
- Stack size tracking
- Hero designation

Example:

```typescript
const { players, addPlayer, removePlayer, updatePlayer, setHeroPlayer } = usePlayerManagement(
  formData,
  setFormData,
);
```

### usePokerGameEngine.ts

**Bridge between UI and poker engine**

Provides:

- Engine initialization
- Action processing
- State synchronization
- Valid action queries
- History tracking

Usage:

```typescript
const { engineState, processAction, getValidActions, isPlayerToAct } = usePokerGameEngine();
```

### useShareHand.ts (Legacy)

**Original hand sharing logic** (being phased out)

Still used for:

- Backward compatibility
- Form utilities
- Action formatting
- Currency handling

### use-mobile.ts

**Responsive design utilities**

Features:

- Mobile detection
- Breakpoint management
- Responsive behaviors
- Touch event handling

## Patterns and Best Practices

### State Management

```typescript
// Encapsulate complex state logic
const useComplexState = (initialState) => {
  const [state, setState] = useState(initialState);

  const updateField = useCallback((field, value) => {
    setState((prev) => ({ ...prev, [field]: value }));
  }, []);

  return { state, updateField };
};
```

### Side Effects

```typescript
// Handle async operations
const useAsyncAction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (action) => {
    setLoading(true);
    try {
      const result = await action();
      return result;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error };
};
```

### Memoization

```typescript
// Optimize expensive computations
const useComputedValue = (deps) => {
  return useMemo(() => {
    return expensiveComputation(deps);
  }, [deps]);
};
```

### Event Handling

```typescript
// Centralized event management
const useEventHandler = (handler) => {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  return useCallback((...args) => {
    return handlerRef.current(...args);
  }, []);
};
```

## Integration Examples

### With Zustand Store

```typescript
const usePokerActions = () => {
  const store = usePokerHandStore();
  const { processAction } = useShareHandContext();

  return {
    fold: () => processAction('fold'),
    check: () => processAction('check'),
    // ... more actions
  };
};
```

### With Context

```typescript
const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return context;
};
```

### With Forms

```typescript
const useFormValidation = (schema) => {
  const [errors, setErrors] = useState({});

  const validate = useCallback(
    (data) => {
      const result = schema.safeParse(data);
      if (!result.success) {
        setErrors(result.error.flatten());
        return false;
      }
      setErrors({});
      return true;
    },
    [schema],
  );

  return { errors, validate };
};
```

## Performance Considerations

### Dependency Arrays

- Always include all dependencies
- Use ESLint rules for exhaustive deps
- Avoid inline objects/functions

### Cleanup

```typescript
useEffect(() => {
  const subscription = subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### Debouncing

```typescript
const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
```

## Testing Hooks

### Setup

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
```

### Testing Pattern

```typescript
describe('useCustomHook', () => {
  it('should handle state updates', () => {
    const { result } = renderHook(() => useCustomHook());

    act(() => {
      result.current.updateState('new value');
    });

    expect(result.current.state).toBe('new value');
  });
});
```
