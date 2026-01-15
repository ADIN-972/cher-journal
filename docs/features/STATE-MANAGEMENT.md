# State Management

## Overview

Cher Journal uses **Zustand** for global state management in the React applications (Admin and Web).

## Why Zustand?

- ✅ Lightweight (< 1KB)
- ✅ Simple API
- ✅ No providers needed
- ✅ TypeScript support
- ✅ DevTools integration
- ✅ Minimal boilerplate

## Store Structure

### Admin App

#### Auth Store (`apps/admin/src/store/auth.ts`)

```typescript
interface AuthState {
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  
  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null });
  },
}));
```

**Usage**:
```typescript
function Dashboard() {
  const { user, checkAuth, logout } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  return (
    <div>
      <p>Welcome {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Web App (Reader)

#### Auth Store
Similar to admin, manages user authentication state.

#### Reader Store (`apps/web/src/store/reader.ts`)

```typescript
interface ReaderState {
  currentChapter: Chapter | null;
  currentVolume: Volume | null;
  currentPage: number;
  perspective: 'NARRATOR' | 'PROTAGONIST';
  
  setChapter: (chapter: Chapter) => void;
  setVolume: (volume: Volume) => void;
  nextPage: () => void;
  prevPage: () => void;
  switchPerspective: () => void;
}

const useReaderStore = create<ReaderState>((set, get) => ({
  currentChapter: null,
  currentVolume: null,
  currentPage: 0,
  perspective: 'NARRATOR',
  
  setChapter: (chapter) => set({ currentChapter: chapter }),
  setVolume: (volume) => set({ currentVolume: volume, currentPage: 0 }),
  nextPage: () => set((state) => ({ currentPage: state.currentPage + 1 })),
  prevPage: () => set((state) => ({ currentPage: Math.max(0, state.currentPage - 1) })),
  switchPerspective: () => set((state) => ({
    perspective: state.perspective === 'NARRATOR' ? 'PROTAGONIST' : 'NARRATOR',
    currentPage: 0,
  })),
}));
```

#### Library Store (`apps/web/src/store/library.ts`)

```typescript
interface LibraryState {
  chapters: Chapter[];
  purchases: Entitlement[];
  loading: boolean;
  
  fetchLibrary: () => Promise<void>;
  hasAccess: (chapterId: string, volumeNumber: number) => boolean;
}

const useLibraryStore = create<LibraryState>((set, get) => ({
  chapters: [],
  purchases: [],
  loading: false,
  
  fetchLibrary: async () => {
    set({ loading: true });
    const [chapters, purchases] = await Promise.all([
      api.get('/reader/chapters'),
      api.get('/reader/purchases'),
    ]);
    set({ 
      chapters: chapters.data, 
      purchases: purchases.data,
      loading: false 
    });
  },
  
  hasAccess: (chapterId, volumeNumber) => {
    const { purchases } = get();
    return purchases.some(p => 
      p.chapterId === chapterId &&
      p.volumeFrom <= volumeNumber &&
      p.volumeTo >= volumeNumber
    );
  },
}));
```

## Best Practices

### 1. Keep Stores Focused
Each store should manage a specific domain:
- `authStore` - User authentication
- `readerStore` - Reading experience
- `libraryStore` - User's content
- `settingsStore` - App preferences

### 2. Avoid Unnecessary Re-renders
Use selectors to pick only needed state:

```typescript
// ❌ Bad - triggers on any auth change
const authState = useAuthStore();

// ✅ Good - only triggers when user changes
const user = useAuthStore(state => state.user);
```

### 3. Async Actions
Handle loading and error states:

```typescript
const useDataStore = create<DataState>((set) => ({
  data: null,
  loading: false,
  error: null,
  
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/data');
      set({ data: response.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

### 4. Persist State (Optional)
Use `persist` middleware for localStorage:

```typescript
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist<SettingsState>(
    (set) => ({
      theme: 'light',
      fontSize: 16,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    {
      name: 'settings-storage', // localStorage key
    }
  )
);
```

### 5. DevTools Integration
Enable Redux DevTools for debugging:

```typescript
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools<State>(
    (set) => ({
      // store definition
    }),
    { name: 'MyStore' }
  )
);
```

## Testing Stores

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './auth';

describe('AuthStore', () => {
  it('should set user on checkAuth', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await result.current.checkAuth();
    });
    
    expect(result.current.user).toBeDefined();
    expect(result.current.loading).toBe(false);
  });
  
  it('should clear user on logout', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
  });
});
```

## Alternative: Context API

For small, isolated state, use React Context:

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>(null!);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

## Performance Tips

1. **Memoize selectors**:
```typescript
const selectUser = useCallback(
  (state: AuthState) => state.user,
  []
);
const user = useAuthStore(selectUser);
```

2. **Split large stores** into smaller, focused stores
3. **Use shallow comparison** for objects:
```typescript
import shallow from 'zustand/shallow';

const { user, loading } = useAuthStore(
  state => ({ user: state.user, loading: state.loading }),
  shallow
);
```

4. **Avoid storing derived data** - compute on the fly or use memoization

## Migration from Redux

If migrating from Redux:
- **No reducers** - use direct `set()` calls
- **No actions** - functions in the store are actions
- **No dispatch** - call store functions directly
- **No connect/mapStateToProps** - use hooks directly
