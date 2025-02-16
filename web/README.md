# Bootstrap 5 Template

## Project Structure

```
.
├── index.html              # Main HTML file
├── assets/
│   ├── css/
│   │   ├── theme.css      # Base theme variables and styles
│   │   ├── components.css # Reusable component styles
│   │   └── custom.css     # Client-specific customizations
│   └── js/
│       └── main.js        # Custom JavaScript
```

## Features

### Typography

- Custom font: Switzer
- Responsive heading sizes
- Special display headings (xxxl, xxl, xl, lg)
- Customized body and lead text

### Color Palette

- Primary: #1D72A7
- Secondary: #152B39
- Grey scale range
- Customizable through CSS variables

### Components

All components are built with Bootstrap 5 and enhanced with custom styling:

1. **Navigation**

   - Responsive navbar
   - Custom hover states
   - Mobile-friendly

2. **Buttons**

   - Multiple sizes
   - Hover effects
   - Active states

## Usage

### Basic Structure

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Bootstrap 5 CSS -->
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />

    <!-- Switzer Font -->
    <link
      href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,700&display=swap"
      rel="stylesheet"
    />

    <!-- Custom CSS -->
    <link href="assets/css/theme.css" rel="stylesheet" />
    <link href="assets/css/components.css" rel="stylesheet" />
    <link href="assets/css/custom.css" rel="stylesheet" />
  </head>
  <body>
    <!-- Your content here -->

    <!-- Bootstrap Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  </body>
</html>
```

### Creating New Pages

1. Copy the basic structure above
2. Use existing components as building blocks
3. Add custom styles in `custom.css` if needed

## Best Practices

1. **Component Reuse**

   - Use existing components whenever possible
   - Maintain consistent spacing
   - Follow the established pattern for new components

2. **Responsive Design**

   - Test all pages across different screen sizes
   - Use Bootstrap's grid system
   - Utilize provided responsive utilities

3. **Custom Styling**

   - Add new styles to `custom.css`
   - Use CSS variables for consistency
   - Follow the established naming conventions
