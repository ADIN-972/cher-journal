# Cher Journal Mobile App - Architecture Design

**Date:** 2026-03-15
**Status:** Approved
**Timeline:** 4 months (Weeks 1-17)
**Platforms:** iOS + Android (Expo)

---

## 1. Architecture Générale

L'app suit une **architecture en couches** avec séparation claire des responsabilités :

1. **Presentation Layer** (UI/Composants) - Écrans, composants réutilisables, navigation
2. **State Layer** (Zustand stores) - Logique métier, state global, synchronisation
3. **Data Layer** (SQLite + API) - Requêtes, caching, persistence locale
4. **Services Layer** - Auth, sync engine, offline detection

**Flux de données :** UI → Zustand actions → Data layer (API ou SQLite) → State update → UI re-render

### Offline Strategy

- **SQLite comme source de vérité locale**
- **API comme source de vérité serveur**
- **Queue de sync** : actions offline stockées, rejoués quand connexion revient
- **Conflict resolution** : serveur prioritaire pour les données sensibles (entitlements)

Cette structure permet d'évoluer graduellement vers WatermelonDB + CRDT (approche 3) sans refactoring majeur.

---

## 2. Structure des Dossiers

```
apps/mobile/
├── app.json                 # Config Expo
├── package.json
├── tsconfig.json
├── src/
│   ├── app/
│   │   ├── _layout.tsx      # Layout racine (navigation)
│   │   ├── (auth)/          # Stack auth (login, signup)
│   │   ├── (main)/          # Stack principal (onglets)
│   │   │   ├── chapters/
│   │   │   ├── library/
│   │   │   ├── account/
│   │   │   └── settings/
│   │   └── index.tsx        # Redirect logic
│   │
│   ├── components/          # Composants réutilisables
│   │   ├── ui/              # Buttons, Cards, Modals, etc.
│   │   ├── chapter/         # Composants chapter-spécifiques
│   │   └── common/          # Header, Footer, Loaders
│   │
│   ├── stores/              # Zustand stores
│   │   ├── authStore.ts
│   │   ├── chapterStore.ts
│   │   ├── volumeStore.ts
│   │   ├── userStore.ts
│   │   └── syncStore.ts     # Gère la queue de sync
│   │
│   ├── services/
│   │   ├── api/             # API client (axios/fetch)
│   │   ├── db/              # SQLite queries
│   │   ├── sync/            # Sync engine
│   │   ├── offline.ts       # Détection connexion
│   │   └── auth.ts          # Auth service
│   │
│   ├── hooks/               # Hooks personnalisés
│   │   ├── useOffline.ts
│   │   ├── useSync.ts
│   │   └── useFetch.ts
│   │
│   ├── types/               # Types TypeScript
│   │   ├── chapter.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   ├── utils/               # Utilitaires
│   │   ├── constants.ts
│   │   ├── storage.ts
│   │   └── format.ts
│   │
│   ├── styles/              # Thème global, tailwind config
│   └── db/
│       └── schema.ts        # Schéma SQLite
│
├── __tests__/               # Tests (mirroir du src/)
└── assets/                  # Images, fonts
```

**Points clés :**
- `(auth)` et `(main)` = route groups Expo Router (navigation conditionnelle)
- Stores séparés par domaine = plus facile à tester et maintenir
- Services layer isolée = API et DB sont interchangeables
- Hooks réutilisables = logique hors des composants

---

## 3. State Management (Zustand)

Chaque **store Zustand** aura une structure cohérente. Exemple avec `chapterStore.ts` :

```typescript
interface ChapterState {
  chapters: Chapter[];
  loading: boolean;
  error: string | null;
  selectedChapter: Chapter | null;

  fetchChapters: () => Promise<void>;
  setSelectedChapter: (chapter: Chapter) => void;
  syncChapters: () => Promise<void>;
}

export const useChapterStore = create<ChapterState>((set, get) => ({
  chapters: [],
  loading: false,
  error: null,
  selectedChapter: null,

  fetchChapters: async () => {
    set({ loading: true });
    try {
      const isOnline = await checkConnection();
      const data = isOnline
        ? await api.getChapters()
        : await db.getChapters();

      set({ chapters: data, error: null });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  setSelectedChapter: (chapter) => set({ selectedChapter: chapter }),

  syncChapters: async () => {
    const chapters = get().chapters;
    await db.saveChapters(chapters);
  }
}));
```

**Stores principaux :**
- `authStore` : user, token, login/logout
- `chapterStore` : chapitres et lectures
- `volumeStore` : volumes, versions
- `userStore` : progress, bookmarks, entitlements
- `syncStore` : queue d'actions offline, status sync

**Avantage :** Chaque feature gère son propre état, stores indépendants et testables.

---

## 4. Data Layer (SQLite + API)

**SQLite est la source de vérité locale.** Schéma :

```typescript
export const schema = {
  chapters: `
    CREATE TABLE chapters (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      protagonistName TEXT,
      description TEXT,
      coverAssetId TEXT,
      status TEXT,
      publishedAt TEXT,
      syncedAt TEXT,
      UNIQUE(id)
    );
  `,
  volumes: `
    CREATE TABLE volumes (
      id TEXT PRIMARY KEY,
      chapterId TEXT NOT NULL,
      volumeNumber INTEGER,
      title TEXT,
      syncedAt TEXT,
      FOREIGN KEY(chapterId) REFERENCES chapters(id)
    );
  `,
  volumeVersions: `
    CREATE TABLE volume_versions (
      id TEXT PRIMARY KEY,
      volumeId TEXT NOT NULL,
      perspective TEXT,
      text TEXT,
      syncedAt TEXT,
      FOREIGN KEY(volumeId) REFERENCES volumes(id)
    );
  `,
  userProgress: `
    CREATE TABLE user_progress (
      id TEXT PRIMARY KEY,
      chapterId TEXT NOT NULL,
      volumeNumber INTEGER,
      perspective TEXT,
      progress INTEGER,
      completedAt TEXT,
      syncedAt TEXT,
      pendingSync INTEGER DEFAULT 1,
      FOREIGN KEY(chapterId) REFERENCES chapters(id)
    );
  `,
  syncQueue: `
    CREATE TABLE sync_queue (
      id TEXT PRIMARY KEY,
      action TEXT,
      payload TEXT,
      createdAt TEXT,
      status TEXT DEFAULT 'pending'
    );
  `
};
```

**Services :**

```typescript
// services/db/chapters.ts
export const chaptersDB = {
  async getAll() {
    const db = await getDatabase();
    return db.getAllAsync('SELECT * FROM chapters');
  },

  async save(chapters: Chapter[]) {
    const db = await getDatabase();
    for (const ch of chapters) {
      await db.runAsync(
        `INSERT OR REPLACE INTO chapters VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [ch.id, ch.title, ch.protagonistName, ch.description,
         ch.coverAssetId, ch.status, ch.publishedAt, new Date().toISOString()]
      );
    }
  }
};

// services/api/chapters.ts
export const chaptersAPI = {
  async getChapters() {
    const response = await api.get('/chapters');
    return response.data;
  }
};
```

**Flow :** App demande données → Hook `useFetch` → Check connexion → API ou SQLite → Zustand → UI

---

## 5. Offline Sync Strategy

Quand l'utilisateur est offline, ses actions (progression de lecture, bookmarks) sont **stockées localement** et rejoués quand la connexion revient.

### Sync Queue Pattern

```typescript
export const syncEngine = {
  async queueAction(action: 'UPDATE_PROGRESS' | 'ADD_BOOKMARK', payload: any) {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO sync_queue (id, action, payload, createdAt, status)
       VALUES (?, ?, ?, ?, ?)`,
      [uuid(), action, JSON.stringify(payload), new Date().toISOString(), 'pending']
    );
  },

  async processPendingActions() {
    const db = await getDatabase();
    const pending = await db.getAllAsync(
      `SELECT * FROM sync_queue WHERE status = 'pending'`
    );

    for (const item of pending) {
      try {
        const payload = JSON.parse(item.payload);

        if (item.action === 'UPDATE_PROGRESS') {
          await api.updateProgress(payload);
        } else if (item.action === 'ADD_BOOKMARK') {
          await api.addBookmark(payload);
        }

        await db.runAsync(
          `UPDATE sync_queue SET status = 'synced' WHERE id = ?`,
          [item.id]
        );
      } catch (error) {
        console.error(`Sync failed for ${item.id}:`, error);
      }
    }
  }
};
```

### Offline Detection Hook

```typescript
export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const subscription = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);

      if (online) {
        syncEngine.processPendingActions();
      }
    });

    return () => subscription();
  }, []);

  return isOnline;
};
```

### Flow Utilisateur Offline

1. User lit un chapitre offline → progress sauvegardé localement
2. Action ajoutée à `sync_queue` avec status `pending`
3. Connexion revient → `processPendingActions()` déclenché automatiquement
4. Actions rejoués sur serveur, entitlements validées côté serveur
5. Si entitlement invalide → rollback local, message à l'user

**Sécurité :** Le serveur est **source de vérité** pour les entitlements. On ne peut pas bypasser les accès en offline.

---

## 6. Navigation (Expo Router)

Expo Router utilise une **navigation basée fichiers** (comme Next.js). Structure conditionnelle selon l'état auth :

```typescript
// app/_layout.tsx
import { useAuthStore } from '@/stores/authStore';

export default function RootLayout() {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack>
      {!isAuthenticated ? (
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="(main)"
          options={{ headerShown: false }}
        />
      )}
    </Stack>
  );
}
```

### Structure Auth

```
app/(auth)/
├── _layout.tsx
├── login.tsx
├── signup.tsx
└── reset-password.tsx
```

### Structure Main (Bottom Tabs)

```
app/(main)/
├── _layout.tsx
├── chapters/
│   ├── _layout.tsx
│   ├── index.tsx      # Liste chapitres
│   └── [id].tsx       # Détail + lecture
├── library/           # Mes lectures
├── account/           # Mon compte
└── settings/          # Paramètres
```

### Bottom Tab Navigation

```typescript
export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E11D48',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tabs.Screen
        name="chapters"
        options={{
          title: 'Chapters',
          tabBarIcon: ({ color }) => <BookIcon color={color} />
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => <LibraryIcon color={color} />
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <UserIcon color={color} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />
        }}
      />
    </Tabs>
  );
}
```

---

## 7. Authentication

### Auth Store

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,

  restoreToken: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const user = await AsyncStorage.getItem('authUser');

      if (token) {
        set({ token, user: JSON.parse(user!), loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('authUser', JSON.stringify(user));

      set({ token, user });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('authUser');
    set({ token: null, user: null });
  }
}));
```

### API Client with Interceptors

```typescript
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({ baseURL: process.env.API_URL });

api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Persistent Auth

- Au démarrage, `restoreToken()` charge token depuis storage
- User reste logged in même après fermeture app
- Token stocké dans AsyncStorage (MVP), migrer vers Secure Storage plus tard

---

## 8. Error Handling & User Feedback

### Error Types

```typescript
export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  ENTITLEMENT_DENIED = 'ENTITLEMENT_DENIED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  OFFLINE = 'OFFLINE',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  context?: any;
}
```

### Error Handler

```typescript
export const handleApiError = (error: any): AppError => {
  if (!error.response) {
    return {
      code: ErrorCode.NETWORK_ERROR,
      message: error.message,
      userMessage: 'Impossible de se connecter. Vérifiez votre connexion.',
    };
  }

  const { status, data } = error.response;

  if (status === 401) {
    return {
      code: ErrorCode.UNAUTHORIZED,
      message: 'Unauthorized',
      userMessage: 'Votre session a expiré. Veuillez vous reconnecter.',
    };
  }

  if (status === 403 && data.code === 'ENTITLEMENT_DENIED') {
    return {
      code: ErrorCode.ENTITLEMENT_DENIED,
      message: 'Access denied',
      userMessage: 'Vous n\'avez pas accès à ce contenu. Achetez-le ou abonnez-vous.',
    };
  }

  return {
    code: ErrorCode.SERVER_ERROR,
    message: data.message,
    userMessage: 'Une erreur s\'est produite. Veuillez réessayer.',
  };
};
```

### User Feedback

- **Loading states** : Spinner pendant les requêtes réseau
- **Toast notifications** : Erreurs temporaires (apparaît 3 sec puis disparaît)
- **Error screens** : Erreurs critiques (offline, pas d'entitlement)
- **Retry buttons** : Permet de rejouer l'action après erreur

---

## 9. Testing & CI/CD

### Testing Strategy (MVP)

```typescript
// __tests__/stores/authStore.test.ts
import { renderHook, act } from '@testing-library/react-native';
import { useAuthStore } from '@/stores/authStore';

describe('authStore', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login('user@example.com', 'password');
    });

    expect(result.current.token).toBeDefined();
    expect(result.current.user).toBeDefined();
  });
});

// __tests__/services/sync/syncEngine.test.ts
describe('syncEngine', () => {
  it('should queue action offline', async () => {
    const db = await getDatabase();
    await syncEngine.queueAction('UPDATE_PROGRESS', { progress: 50 });

    const queue = await db.getAllAsync('SELECT * FROM sync_queue');
    expect(queue.length).toBe(1);
    expect(queue[0].status).toBe('pending');
  });
});
```

### Test Focus (Phase 1)

- ✅ Stores (Zustand logic)
- ✅ Services (API, DB, sync)
- ⏳ Components (phase 2)
- ⏳ E2E (phase 2)

### CI/CD with EAS

```json
{
  "build": {
    "preview": {
      "android": { "buildType": "apk" },
      "ios": { "buildType": "simulator" }
    },
    "production": {
      "android": { "buildType": "aab" },
      "ios": { "buildType": "archive" }
    }
  },
  "submit": {
    "production": {
      "android": { "track": "internal" },
      "ios": { "testflight": true }
    }
  }
}
```

### Workflow

- Branch `develop` → builds preview (TestFlight/Play Store internal testing)
- PR validations : lint, tests, type-check
- Merge to `main` → build production (App Store/Play Store)

### Tools

- **Jest** : Unit tests
- **React Native Testing Library** : Component tests
- **ESLint + Prettier** : Code quality
- **TypeScript** : Type safety
- **EAS Build** : Builds compilées dans le cloud

---

## Implementation Timeline

### Week 1-3: Setup & Foundation
- Initialize Expo project + TypeScript
- Setup folder structure
- Configure Zustand stores skeleton
- Create SQLite schema + migrations

### Week 4-11: Offline Reading Feature
- Implement chapters listing & caching
- Volume + version data layer
- Volume reader screen
- Offline sync for chapter data

### Week 12-15: Actions & Sync
- Implement user progress tracking
- Bookmarks / collections
- Sync queue + conflict resolution
- Network state detection & sync triggers

### Week 16-17: Polish & Testing
- Component tests
- E2E testing
- Bug fixes & performance
- App Store / Play Store prep

---

## Migration Path to Approach 3

When ready to upgrade to WatermelonDB + CRDT:
1. Keep Zustand stores intact (same API)
2. Replace SQLite layer with WatermelonDB
3. Enhance sync engine with CRDT algorithms
4. No UI changes needed

---

## Notes

- **Security:** Token stored in AsyncStorage (MVP). Migrate to Secure Storage post-launch.
- **Performance:** Lazy load chapters, paginate volume lists, optimize images
- **Scalability:** Zustand stores can be replaced with Redux later if needed
- **Offline Limit:** Users can read downloaded content but can't bypass entitlements
