
# AromaCHAT UI Guidelines

## Mobile-First Design Principles

### 1. Touch Targets
- All interactive elements (buttons, links, form controls) should be at least 44×44px on mobile
- Use appropriate spacing between interactive elements (min 8px)

### 2. Typography
- Use responsive text sizes:
  - Headings: text-2xl on mobile, text-3xl on desktop
  - Body: text-sm on mobile, text-base on desktop
- Limit line length for readability (max-w-prose)
- Use sufficient line height (leading-relaxed)

### 3. Layout
- Use a single column layout on mobile
- On desktop, use 2+ columns where appropriate
- Use appropriate padding: px-4 py-4 on mobile, px-6 py-6 on desktop
- Use consistent spacing scale (0.25rem/0.5rem/0.75rem/1rem/1.5rem/2rem)

### 4. Navigation
- Use a bottom navigation bar for primary actions on mobile
- Use a top navigation bar on desktop
- Hide secondary navigation in a hamburger menu on mobile
- Use Drawer component for mobile menus

### 5. Forms
- Stack form elements vertically on mobile
- Use full-width inputs on mobile
- Use appropriate input size (min-h-12)
- Use clear validation messaging
- Show only essential form fields initially

### 6. Content
- Prioritize content - most important first
- Use progressive disclosure (accordions, tabs) for secondary content
- Use collapsible sections to save vertical space
- Show less content initially on mobile

### 7. Components

#### Cards
- Use full-width cards on mobile
- Add appropriate padding (p-4)
- Limit content to essential information
- Use clear visual hierarchy

#### Modals/Dialogs
- Use full-screen modals on mobile
- Use the Drawer component for bottom sheets
- Ensure large enough touch targets for close buttons

#### Lists
- Use sufficient spacing between list items
- Provide clear visual separation
- Use appropriate text size

### 8. Visual Design
- Use consistent color scheme throughout
- Ensure sufficient contrast (min 4.5:1 for text)
- Use visual indicators for interactive elements
- Use animation sparingly and purposefully

### 9. Accessibility
- Ensure text meets minimum contrast requirements
- Provide text alternatives for images
- Make sure interactive elements are keyboard accessible
- Test with screen readers

### 10. Performance
- Optimize images for mobile
- Minimize unnecessary animations on mobile
- Lazy-load content when possible
- Monitor and optimize load times

## Implementation Example

```jsx
// Mobile-friendly component example
function MobileCard({ title, content }) {
  const isMobile = useIsMobile();
  
  return (
    <Card className={cn(
      "w-full", 
      isMobile ? "p-4" : "p-6"
    )}>
      <h3 className={cn(
        "font-medium",
        isMobile ? "text-lg" : "text-xl"
      )}>
        {title}
      </h3>
      <p className={cn(
        "text-gray-600",
        isMobile ? "text-sm" : "text-base"
      )}>
        {content}
      </p>
    </Card>
  );
}
```
