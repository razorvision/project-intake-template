# Create Component Command

Create a new React component following project standards.

## Instructions

Ask the user for:
1. Component name (PascalCase)
2. Component type (page, feature component, UI component)
3. Required props
4. Whether it needs state management
5. Whether it needs data fetching

Then create the component following these standards:

## Component Template

```typescript
/**
 * [ComponentName] - [Brief description]
 *
 * @example
 * <ComponentName prop1="value" prop2={value} />
 */

// 1. Imports (ordered: React → third-party → local → types → styles)
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query'; // if data fetching
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ComponentNameProps } from '@/types';

// 2. Type definitions
interface ComponentNameProps {
  prop1: string;
  prop2?: number;
  className?: string;
}

// 3. Component definition
export function ComponentName({ prop1, prop2, className }: ComponentNameProps) {
  // 4. State
  const [state, setState] = useState<Type>(initialValue);

  // 5. Hooks (data fetching, custom hooks)
  const { data, isLoading, error } = useQuery({
    queryKey: ['key'],
    queryFn: fetchFunction,
  });

  // 6. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // 7. Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // 8. Helper functions
  const helperFunction = () => {
    // Helper logic
  };

  // 9. Early returns
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  // 10. Main render
  return (
    <div className={cn('component-container', className)}>
      <h2>{prop1}</h2>
      <Button onClick={handleClick}>
        Click me
      </Button>
    </div>
  );
}
```

## File Location Rules

- **UI Components** → `src/components/ui/ComponentName.tsx`
- **Feature Components** → `src/components/ComponentName.tsx`
- **Page Components** → `src/pages/ComponentName.tsx`

## Also Create

1. **Test File** → `ComponentName.test.tsx`
```typescript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName prop1="test" />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<ComponentName prop1="test" onClick={handleClick} />);
    // Test click behavior
  });
});
```

2. **Export from index** (if in components directory)
Update `src/components/index.ts`:
```typescript
export { ComponentName } from './ComponentName';
```

## Confirm with User

After generating files, show:
- File paths created
- Ask if they want to add any additional functionality
- Ask if they want to create a Storybook story (if project uses Storybook)
