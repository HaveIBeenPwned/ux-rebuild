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

3. **Tables**

   - Two variants: with and without headers
   - Customizable row icons
   - Flexible action buttons
   - Hover states
   - Responsive design

   Basic table structure:

   ```html
   <div class="table-responsive">
     <table class="table">
       <tbody>
         <tr>
           <td>
             <!-- For clickable rows -->
             <a href="#" class="table-row-link">
               <!-- Left icon (optional) -->
               <div class="table-row-icon me-3">
                 <i class="bi bi-database"></i>
               </div>
               <!-- Main content -->
               <div class="flex-grow-1">Row content</div>
               <!-- Number formatting (optional) -->
               <div class="text-grey-400 me-3">123,456</div>
               <!-- Action button (optional) -->
               <button class="btn btn-secondary-sm table-action">
                 <i class="bi bi-arrow-right"></i>
               </button>
             </a>
           </td>
         </tr>
       </tbody>
     </table>
   </div>
   ```

   With headers:

   ```html
   <div class="table-responsive">
     <table class="table">
       <thead>
         <tr>
           <th scope="col">Column 1</th>
           <th scope="col">Column 2</th>
           <th scope="col"></th>
         </tr>
       </thead>
       <tbody>
         <tr>
           <td>
             <div class="d-flex align-items-center">
               <div class="table-row-icon me-3">
                 <i class="bi bi-database"></i>
               </div>
               <div>Content</div>
             </div>
           </td>
           <td>Content</td>
           <td>
             <button class="btn btn-secondary-sm table-action">
               <i class="bi bi-arrow-right"></i>
             </button>
           </td>
         </tr>
       </tbody>
     </table>
   </div>
   ```

   Available classes apart from Bootstrap classes:

   - `table-row-link`: For clickable rows
   - `table-row-icon`: Left-side icon container
   - `table-action`: Right-side action button

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
