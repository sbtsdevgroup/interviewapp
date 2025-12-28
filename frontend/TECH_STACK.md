# 🛠️ Tech Stack Documentation

## ✅ Installed Technologies

### Core Framework
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **React 18** - UI library

### UI & Styling
- **shadcn/ui** - High-quality component library
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Icon library

### State Management
- **Zustand** - Lightweight state management
  - Used for authentication state
  - Persisted to localStorage

### Data Fetching
- **TanStack Query (React Query)** - Powerful data synchronization
  - Automatic caching
  - Background refetching
  - Optimistic updates

### Forms & Validation
- **React Hook Form** - Performant forms
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Zod integration for React Hook Form

### HTTP Client
- **Axios** - Promise-based HTTP client
  - Request/response interceptors
  - Automatic token injection
  - Error handling

### Utilities
- **clsx** - Conditional className utility
- **tailwind-merge** - Merge Tailwind classes
- **class-variance-authority** - Component variants

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── login/             # Login page
│   ├── dashboard/         # Dashboard page
│   └── layout.tsx         # Root layout with providers
├── lib/
│   ├── components/        # Reusable components
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── providers/         # Context providers
│   ├── services/          # API services
│   ├── store/             # Zustand stores
│   └── utils/             # Utility functions
└── styles/                # CSS modules (legacy)
```

## 🎨 shadcn/ui Components

Available components:
- **Button** - `@/lib/components/ui/button`
- **Input** - `@/lib/components/ui/input`
- **Card** - `@/lib/components/ui/card`
- **Label** - `@/lib/components/ui/label`
- **Badge** - `@/lib/components/ui/badge`

To add more components:
```bash
npx shadcn-ui@latest add [component-name]
```

## 🔐 Authentication Flow

1. **Zustand Store** (`lib/store/auth-store.ts`)
   - Manages auth state
   - Persists to localStorage
   - Provides `setAuth()` and `clearAuth()`

2. **API Interceptors** (`lib/services/api.ts`)
   - Automatically adds JWT token to requests
   - Handles 401/403 errors
   - Redirects to login on auth failure

3. **Custom Hook** (`lib/hooks/use-student.ts`)
   - Wraps TanStack Query
   - Provides login/logout functions
   - Manages student data fetching

## 📡 Data Fetching Pattern

Using TanStack Query:

```typescript
const { studentData, interviewStatus, isLoading } = useStudent();
```

Benefits:
- Automatic caching
- Background refetching
- Loading/error states
- Optimistic updates

## 🎯 Usage Examples

### Using Zustand Store
```typescript
import { useAuthStore } from '@/lib/store/auth-store';

const { token, student, isAuthenticated, setAuth, clearAuth } = useAuthStore();
```

### Using Custom Hook
```typescript
import { useStudent } from '@/lib/hooks/use-student';

const { login, logout, studentData, isLoading } = useStudent();
```

### Using shadcn/ui Components
```typescript
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';

<Card>
  <CardContent>
    <Button>Click me</Button>
  </CardContent>
</Card>
```

## 🚀 Next Steps

1. **Add more shadcn/ui components** as needed
2. **Create more custom hooks** for specific features
3. **Add form validation** with React Hook Form + Zod
4. **Implement error boundaries** for better error handling
5. **Add loading skeletons** for better UX

## 📚 Documentation Links

- [Next.js](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**All technologies are installed and ready to use! 🎉**

