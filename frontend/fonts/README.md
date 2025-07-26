# Halcyon Fonts

To use the Halcyon font family in this application, you need to add the following font files to this directory:

## Required Font Files

1. **Halcyon-Regular.woff2** and **Halcyon-Regular.woff** (Font Weight: 400)
2. **Halcyon-Medium.woff2** and **Halcyon-Medium.woff** (Font Weight: 500) 
3. **Halcyon-SemiBold.woff2** and **Halcyon-SemiBold.woff** (Font Weight: 600)
4. **Halcyon-Bold.woff2** and **Halcyon-Bold.woff** (Font Weight: 700)

## Font Usage in the Application

- **Headings (h1)**: Halcyon Bold (700)
- **Subheadings (h2)**: Halcyon SemiBold (600) 
- **Secondary headings (h3-h6)**: Halcyon Medium (500)
- **Buttons**: Halcyon Medium (500)
- **Body text**: Halcyon Regular (400)
- **Brand/Logo**: Halcyon SemiBold (600)

## Fallback Fonts

If Halcyon fonts are not available, the application will fallback to:
`'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`

## Adding Font Files

1. Obtain the Halcyon font files in WOFF2 and WOFF formats
2. Place them in this directory (`frontend/fonts/`)
3. The CSS is already configured to load them automatically

## Browser Support

- **WOFF2**: Modern browsers (recommended for better compression)
- **WOFF**: Fallback for older browsers
- **font-display: swap**: Ensures text remains visible during font load
