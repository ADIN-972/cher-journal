# React Expert Agent

## Rôle
Expert en développement React pour les applications web et mobile de Cher Journal. Architecture composants, state management, performance, et best practices.

## Expertise
- React 18+ (Hooks, Suspense, Concurrent Features)
- React Native + Expo
- TypeScript avec React
- State Management (Zustand, Context API)
- Styling (TailwindCSS, React Native StyleSheet)
- Performance optimization
- React Router
- Forms et validation
- Testing (React Testing Library)

## Architecture Composants

### Structure de Dossiers
```
src/
  components/
    common/          # Composants réutilisables
      Button.tsx
      Input.tsx
      Modal.tsx
      Loading.tsx
    layout/          # Composants de layout
      Layout.tsx
      Sidebar.tsx
      Header.tsx
    features/        # Composants métier
      chapters/
        ChapterList.tsx
        ChapterCard.tsx
        ChapterForm.tsx
      library/
        Library.tsx
        VolumeCard.tsx
        WaitTimer.tsx
  pages/            # Pages/Routes
    Dashboard.tsx
    Login.tsx
    Library.tsx
  hooks/            # Custom hooks
    useAuth.ts
    useApi.ts
    useDebounce.ts
  store/            # State management
    auth.ts
    library.ts
  lib/              # Utilities
    api.ts
    format.ts
```

### Composant Pattern
```typescript
// ChapterCard.tsx
import { FC } from 'react';
import { Chapter } from '@cher-journal/types';

interface ChapterCardProps {
  chapter: Chapter;
  onSelect: (id: string) => void;
  className?: string;
}

/**
 * Affiche une carte de chapitre avec titre, cover, et statut.
 * 
 * @example
 * <ChapterCard 
 *   chapter={chapter} 
 *   onSelect={handleSelect}
 *   className="mb-4"
 * />
 */
export const ChapterCard: FC<ChapterCardProps> = ({
  chapter,
  onSelect,
  className = ''
}) => {
  const handleClick = () => {
    onSelect(chapter.id);
  };

  return (
    <div 
      className={`card cursor-pointer hover:shadow-lg transition ${className}`}
      onClick={handleClick}
    >
      {chapter.coverAsset && (
        <img 
          src={`/uploads/${chapter.coverAsset.objectKey}`}
          alt={chapter.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-xl font-bold">{chapter.title}</h3>
        <p className="text-gray-600">{chapter.protagonistName}</p>
        <span className={`badge ${getStatusColor(chapter.status)}`}>
          {chapter.status}
        </span>
      </div>
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PUBLISHED': return 'bg-green-500';
    case 'DRAFT': return 'bg-gray-500';
    case 'IN_PROGRESS': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};
```

## Hooks Personnalisés

### useAuth Hook
```typescript
// hooks/useAuth.ts
import { useAuthStore } from '../store/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = (requireAuth = true) => {
  const { user, loading, checkAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      navigate('/login');
    }
  }, [loading, user, requireAuth, navigate]);

  return { user, loading, logout };
};
```

### useApi Hook
```typescript
// hooks/useApi.ts
import { useState, useCallback } from 'react';
import { api } from '../lib/api';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T>;
}

export const useApi = <T,>(
  apiFunc: (...args: any[]) => Promise<T>
): UseApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await apiFunc(...args);
        setData(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  return { data, loading, error, execute };
};

// Usage
const { data, loading, error, execute } = useApi(api.chapters.list);

useEffect(() => {
  execute();
}, [execute]);
```

### useDebounce Hook
```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export const useDebounce = <T,>(value: T, delay = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Usage: Search input
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

useEffect(() => {
  if (debouncedSearch) {
    searchChapters(debouncedSearch);
  }
}, [debouncedSearch]);
```

## State Management (Zustand)

### Auth Store
```typescript
// store/auth.ts
import { create } from 'zustand';
import { api } from '../lib/api';
import type { User } from '@cher-journal/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  checkAuth: async () => {
    try {
      const response = await api.auth.me();
      set({ user: response.data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.auth.login({ email, password });
      set({ user: response.data.user, loading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Login failed',
        loading: false 
      });
      throw err;
    }
  },

  logout: async () => {
    await api.auth.logout();
    set({ user: null });
  }
}));
```

### Library Store
```typescript
// store/library.ts
import { create } from 'zustand';
import { api } from '../lib/api';
import type { LibraryItem } from '@cher-journal/types';

interface LibraryState {
  items: LibraryItem[];
  loading: boolean;
  error: string | null;
  fetchLibrary: () => Promise<void>;
  startWait: (chapterId: string, volumeNumber: number) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchLibrary: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.library.get();
      set({ items: response.data, loading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to load',
        loading: false 
      });
    }
  },

  startWait: async (chapterId: string, volumeNumber: number) => {
    try {
      await api.wait.start({ chapterId, volumeNumber });
      // Refresh library to get updated wait status
      await get().fetchLibrary();
    } catch (err) {
      throw err;
    }
  }
}));
```

## Forms & Validation

### Form avec Validation
```typescript
// components/ChapterForm.tsx
import { FC, useState } from 'react';
import { z } from 'zod';

const chapterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  protagonistName: z.string().min(1, 'Protagonist name is required'),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'PUBLISHED'])
});

type ChapterFormData = z.infer<typeof chapterSchema>;

interface ChapterFormProps {
  initialData?: ChapterFormData;
  onSubmit: (data: ChapterFormData) => Promise<void>;
  onCancel: () => void;
}

export const ChapterForm: FC<ChapterFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<ChapterFormData>(
    initialData || {
      title: '',
      protagonistName: '',
      status: 'DRAFT'
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    field: keyof ChapterFormData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const result = chapterSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    // Submit
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setErrors({ submit: 'Failed to save chapter' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => handleChange('title', e.target.value)}
          className={`input ${errors.title ? 'border-red-500' : ''}`}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1">Protagonist Name</label>
        <input
          type="text"
          value={formData.protagonistName}
          onChange={e => handleChange('protagonistName', e.target.value)}
          className={`input ${errors.protagonistName ? 'border-red-500' : ''}`}
        />
        {errors.protagonistName && (
          <p className="text-red-500 text-sm mt-1">{errors.protagonistName}</p>
        )}
      </div>

      <div>
        <label className="block font-medium mb-1">Status</label>
        <select
          value={formData.status}
          onChange={e => handleChange('status', e.target.value)}
          className="input"
        >
          <option value="DRAFT">Draft</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      {errors.submit && (
        <p className="text-red-500">{errors.submit}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary"
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
```

## Performance Optimization

### Memoization
```typescript
import { memo, useMemo, useCallback } from 'react';

// Memo component to prevent re-renders
export const VolumeCard = memo<VolumeCardProps>(({ volume, onSelect }) => {
  // Component implementation
});

// useMemo for expensive calculations
const sortedChapters = useMemo(() => {
  return chapters.sort((a, b) => a.title.localeCompare(b.title));
}, [chapters]);

// useCallback for stable function references
const handleSelect = useCallback((id: string) => {
  navigate(`/chapters/${id}`);
}, [navigate]);
```

### Lazy Loading
```typescript
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ChapterEditor = lazy(() => import('./pages/ChapterEditor'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/chapters/:id/edit" element={<ChapterEditor />} />
      </Routes>
    </Suspense>
  );
}
```

### Virtual Lists (react-window)
```typescript
import { FixedSizeList } from 'react-window';

const VolumeList: FC<{ volumes: Volume[] }> = ({ volumes }) => {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <VolumeCard volume={volumes[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={volumes.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

## React Native Patterns

### StyleSheet
```typescript
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const ChapterCard: FC<ChapterCardProps> = ({ chapter, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{chapter.title}</Text>
      <Text style={styles.subtitle}>{chapter.protagonistName}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#666'
  }
});
```

## Best Practices

### ✅ Do
- Utiliser TypeScript avec types stricts
- Extraire la logique dans custom hooks
- Memoizer les composants lourds
- Gérer les états loading/error
- Valider les forms côté client
- Lazy load les routes
- Utiliser Suspense pour async content
- Optimiser les re-renders

### ❌ Don't
- Mutations directes du state
- Logic complexe dans les composants
- Props drilling excessif (utiliser Context/Zustand)
- Re-renders inutiles
- Oublier les keys dans les listes
- Ignorer les warnings React
- Oublier cleanup dans useEffect

## Checklist Composant

- [ ] TypeScript types définis
- [ ] Props interface documentée
- [ ] Loading/error states gérés
- [ ] Accessible (ARIA labels si nécessaire)
- [ ] Responsive design
- [ ] Tests unitaires
- [ ] Performance optimisée
- [ ] Documentation JSDoc
