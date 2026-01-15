# Design System

## Colors

### Brand Colors
- **Primary Blue**: `#2563eb` (blue-600)
- **Secondary Gray**: `#4b5563` (gray-600)
- **Success Green**: `#10b981` (green-500)
- **Error Red**: `#ef4444` (red-500)
- **Warning Yellow**: `#f59e0b` (amber-500)

### Backgrounds
- **White**: `#ffffff`
- **Light Gray**: `#f9fafb` (gray-50)
- **Dark Gray**: `#1f2937` (gray-800)

## Typography

### Font Family
- **System Font Stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`

### Font Sizes (TailwindCSS)
- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)

## Components

### Buttons

#### Primary Button
```tsx
<button className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
  Action
</button>
```

#### Secondary Button
```tsx
<button className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
  Cancel
</button>
```

#### Danger Button
```tsx
<button className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">
  Delete
</button>
```

### Forms

#### Input Field
```tsx
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
```

#### Select Field
```tsx
<select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
  <option>Option 1</option>
</select>
```

#### Checkbox
```tsx
<input
  type="checkbox"
  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
/>
```

### Cards
```tsx
<div className="bg-white rounded-lg shadow p-6">
  {/* Content */}
</div>
```

### Modals
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
    {/* Modal content */}
  </div>
</div>
```

## Spacing

Use TailwindCSS spacing scale (multiples of 0.25rem):
- **Tight**: `space-y-2` (0.5rem / 8px)
- **Normal**: `space-y-4` (1rem / 16px)
- **Relaxed**: `space-y-6` (1.5rem / 24px)
- **Loose**: `space-y-8` (2rem / 32px)

## Responsive Design

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## Icons

Using inline SVG icons from Heroicons concepts:
- Arrow icons for navigation
- Trash icon for delete actions
- Pencil icon for edit actions
- Plus icon for create actions

## Toasts (react-hot-toast)

### Configuration
```tsx
<Toaster
  position="top-right"
  toastOptions={{
    duration: 4000,
    style: {
      background: '#363636',
      color: '#fff',
    },
    success: {
      duration: 3000,
      iconTheme: {
        primary: '#10b981',
        secondary: '#fff',
      },
    },
    error: {
      duration: 5000,
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
    },
  }}
/>
```
