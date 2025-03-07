# CSS Structure

This project uses a structured approach to CSS that leverages Bootstrap 5's CSS variables for theming without relying on `!important` declarations.

## File Structure

The CSS files are organized in the following order of loading:

1. **Bootstrap 5 CSS** - The base framework loaded from CDN
2. **bootstrap-variables.css** - Overrides Bootstrap's CSS variables with our custom theme values
3. **theme.css** - Defines our custom CSS variables that map to Bootstrap's variables and adds custom styles
4. **components.css** - Component-specific styles
5. **custom.css** - Project-specific customizations and overrides

## How It Works

### 1. Bootstrap Variables Override

The `bootstrap-variables.css` file overrides Bootstrap's CSS variables with our custom theme values. This is the key to avoiding `!important` declarations. By setting these variables, we're changing Bootstrap's default values at their source.

Example:

```css
:root {
  --bs-primary: #1d72a7;
  --bs-secondary: #152b39;
  /* More Bootstrap variable overrides */
}
```

### 2. Custom Theme Variables

The `theme.css` file defines our custom CSS variables that map to Bootstrap's variables. This creates a layer of abstraction that makes it easier to maintain our theme.

Example:

```css
:root {
  --primary: var(--bs-primary);
  --secondary: var(--bs-secondary);
  /* More custom variables */
}
```

### 3. Component-Specific Variables

The `bootstrap-variables.css` file also defines component-specific variables that are used in `components.css`. This approach allows us to avoid using `!important` declarations in component styles.

Example:

```css
/* In bootstrap-variables.css */
:root {
  --navbar-bg-color: rgba(3, 3, 4, 0.8);
  --navbar-backdrop-filter: blur(10px);
  --nav-link-padding: 0.5rem 0.75rem;
}

/* In components.css */
.navbar {
  background-color: var(--navbar-bg-color);
  backdrop-filter: var(--navbar-backdrop-filter);
}

.nav-link {
  padding: var(--nav-link-padding);
}
```

### 4. Using the Variables

We can then use our custom variables throughout the project:

```css
.custom-element {
  color: var(--primary);
  background-color: var(--grey-800);
}
```

## Component Styling Examples

### Modal Styling

For modals, we use a combination of direct color values and CSS variables to ensure consistent styling:

```css
/* In bootstrap-variables.css */
:root {
  /* Navbar border color */
  --navbar-border-color: rgba(255, 255, 255, 0.1);

  /* Bootstrap modal variables */
  --bs-modal-bg: #374a5a; /* Direct color value */
  --bs-modal-border-color: rgba(255, 255, 255, 0.1); /* Match navbar border */

  /* Custom modal variables */
  --modal-content-bg: #374a5a; /* Direct color value */
  --modal-border-color: rgba(255, 255, 255, 0.1); /* Match navbar border */
}

/* In components.css */
/* Direct color approach for consistent modal backgrounds */
.modal-content {
  background-color: #374a5a; /* Direct color value */
  color: var(--white);
  border-color: var(--modal-border-color);
}

.modal-dark .modal-content {
  background-color: #374a5a; /* Direct color value */
  backdrop-filter: blur(8px);
  border: 1px solid var(--modal-border-color);
}

.modal-header {
  border-bottom-color: var(--modal-border-color);
}

.modal-footer {
  border-top-color: var(--modal-border-color);
}
```

This approach ensures that all modal backgrounds have a consistent solid color, and that border colors match the navbar for a cohesive design.

## Font Handling

The project uses the Switzer font from Fontshare. To ensure proper font application:

1. The font is loaded in the HTML head section before other resources
2. Font variables are set in multiple places to ensure consistent application:
   - `--bs-font-sans-serif` and `--bs-body-font-family` in bootstrap-variables.css
   - A universal selector rule (`*`) to ensure all elements inherit the font
   - Explicit font-family declaration in the body selector

This multi-layered approach ensures the font is applied consistently across all elements, even when Bootstrap's default styles might try to override it.

## Adding New Theme Elements

To add new theme elements:

1. First, check if Bootstrap has a CSS variable for it in their documentation
2. If it exists, override it in `bootstrap-variables.css`
3. Create a mapping in `theme.css` if you want to use a custom variable name
4. Use the variable in your CSS

## Adding New Component Styles

When adding new component styles:

1. Check if there's an existing Bootstrap component that can be customized
2. Define component-specific variables in `bootstrap-variables.css`
3. Use these variables in your component styles in `components.css`
4. Avoid using `!important` declarations by leveraging CSS variables and proper specificity
5. For critical UI elements like modals, consider using direct color values if variable-based approaches cause rendering issues

## Bootstrap 5 CSS Variables Reference

Bootstrap 5 provides many CSS variables that you can override. Here are some of the most commonly used ones:

- `--bs-primary`, `--bs-secondary`, etc. - Theme colors
- `--bs-body-font-family`, `--bs-body-font-size` - Typography
- `--bs-border-radius`, `--bs-border-color` - Borders
- `--bs-card-bg`, `--bs-modal-bg` - Component backgrounds

For a complete list, refer to the [Bootstrap 5 documentation](https://getbootstrap.com/docs/5.3/customize/css-variables/).
