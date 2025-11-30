# Frontend Development Conventions

## Component Architecture

### Component Organization

- **Pages**: Route-level components in `/src/pages/` (e.g., `TeacherClasses.jsx`, `StudentClasses.jsx`)
- **Components**: Reusable UI components in `/src/components/` (e.g., `Navigation.jsx`, `FeatureCard.jsx`)
- **Context**: State management in `/src/context/` (e.g., `AuthContext.jsx`)
- **Services**: API calls in `/src/services/` (e.g., `api.js`)
- **Utils**: Helper functions in `/src/utils/`

### Naming Conventions

- **Components**: PascalCase (e.g., `LoadingSpinner.jsx`, `FormInput.jsx`)
- **Pages**: PascalCase with descriptive names (e.g., `TeacherClasses.jsx`, `ComingSoon.jsx`)
- **Props**: camelCase (e.g., `onSwitchToLogin`, `buttonText`)
- **State variables**: camelCase (e.g., `currentTime`, `isMenuOpen`)

### Component Structure

```jsx
// Standard component template
import {useState, useEffect} from "react";
import {useAuth} from "../context/AuthContext";

const ComponentName = ({prop1, prop2}) => {
  const [localState, setLocalState] = useState(initialValue);
  const {contextValue} = useAuth();

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  const handleAction = () => {
    // Event handlers
  };

  return <div className="container-classes">{/* JSX content */}</div>;
};

export default ComponentName;
```

## Styling Guidelines

### Tailwind CSS Usage

- **Responsive Design**: Mobile-first approach using `sm:`, `md:`, `lg:` prefixes
- **Color Palette**:
  - Primary: `blue-600` (#2563eb)
  - Success: `green-600` (#059669)
  - Warning: `orange-600` (#ea580c)
  - Purple: `purple-600` (#7c3aed)
- **Spacing**: Use Tailwind's spacing scale (4, 6, 8, 12, 16, etc.)
- **Gradients**: Use `bg-gradient-to-r from-{color}-500 to-{color}-600` for cards and buttons

### Component Styling Patterns

- **Cards**: `bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300`
- **Buttons**: `px-4 py-2 rounded-md font-medium transition-colors duration-200`
- **Forms**: Use `FormInput` component with consistent styling
- **Navigation**: Responsive with mobile hamburger menu

## State Management

### Authentication Context

- Use `useAuth()` hook for user state and authentication actions
- Available methods: `login`, `register`, `logout`, `clearError`
- Available state: `user`, `isAuthenticated`, `loading`, `error`

### Local State

- Use `useState` for component-specific state
- Use `useEffect` for side effects and cleanup
- Keep state as close to where it's used as possible

## Role-Based Features

### Teacher Features

- Manage Classes
- Student Progress
- Assignments
- Grade Book
- Communication
- Resources

### Student Features

- My Classes
- Assignments
- Progress
- Schedule
- Resources
- Messages

### Implementation Pattern

```jsx
{
  user?.role === "teacher" ? (
    <TeacherSpecificComponent />
  ) : (
    <StudentSpecificComponent />
  );
}
```

## Error Handling

### Error Display

- Use `Alert` component for user-facing errors
- Types: `error`, `success`, `warning`, `info`
- Include dismiss functionality with `onClose` prop

### API Error Handling

- Catch errors in try-catch blocks
- Display user-friendly messages
- Log detailed errors for debugging

## Loading States

### Loading Indicators

- Use `LoadingSpinner` component with appropriate sizes (`sm`, `md`, `lg`)
- Show loading states during API calls
- Disable buttons during loading with `disabled` prop

## Navigation

### Route Structure

- Dashboard: Main landing page after login
- Role-specific pages: `/teacher/classes`, `/student/classes`
- Coming Soon: Placeholder for future features

### Navigation Component

- Responsive design with mobile menu
- Role-based menu items
- User profile display with logout functionality

## Form Handling

### Form Components

- Use `FormInput` component for consistent styling
- Include icons for better UX
- Implement proper validation and error display

### Form Patterns

```jsx
const [formData, setFormData] = useState({
  field1: "",
  field2: "",
});

const handleChange = (e) => {
  const {name, value} = e.target;
  setFormData((prev) => ({...prev, [name]: value}));
};
```

## Performance Guidelines

### Component Optimization

- Use `useCallback` for event handlers passed to child components
- Use `useMemo` for expensive calculations
- Implement proper dependency arrays in `useEffect`

### Code Splitting

- Use dynamic imports for large components
- Implement lazy loading for routes when needed

## Accessibility

### ARIA Labels

- Include proper `aria-label` attributes
- Use semantic HTML elements
- Ensure keyboard navigation works

### Color Contrast

- Maintain WCAG AA compliance
- Use sufficient color contrast ratios
- Don't rely solely on color for information

## Testing Considerations

### Component Testing

- Test user interactions
- Test different user roles
- Test error states and loading states
- Mock API calls and context providers
