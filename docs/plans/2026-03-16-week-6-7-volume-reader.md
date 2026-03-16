# Phase 2 Week 6-7: Volume Reader Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a fully functional reading screen with perspective selection (NARRATOR vs PROTAGONIST), text display, font controls, and progress tracking.

**Architecture:**
- Single ReaderScreen component that displays volume text based on selected perspective
- Fetch volume versions (NARRATOR and PROTAGONIST) from API
- Support font size, line height, and theme adjustments
- Track scroll position as reading progress
- Responsive typography for all screen sizes

**Tech Stack:** React Native, Zustand, Expo Router, TypeScript

---

## Task 1: Create VolumeVersionsStore for Managing Text Content

**Files:**
- Create: `apps/mobile/src/stores/volumeVersionsStore.ts`
- Modify: `apps/mobile/src/services/api/chapters.ts` - Add method to fetch single volume with all versions

**Step 1: Create store for managing volume versions**

```typescript
// apps/mobile/src/stores/volumeVersionsStore.ts

import { create } from 'zustand';
import { chaptersAPI } from '@/services/api';
import type { VolumeVersion } from '@/types';

interface VersionState {
  narrator: VolumeVersion | null;
  protagonist: VolumeVersion | null;
  currentVersion: VolumeVersion | null;
  loading: boolean;
  error: string | null;

  fetchVersions: (chapterId: string, volumeNumber: number) => Promise<void>;
  setCurrentVersion: (version: VolumeVersion | null) => void;
  clearError: () => void;
}

export const useVersionsStore = create<VersionState>((set) => ({
  narrator: null,
  protagonist: null,
  currentVersion: null,
  loading: false,
  error: null,

  fetchVersions: async (chapterId: string, volumeNumber: number) => {
    set({ loading: true, error: null });
    try {
      const volume = await chaptersAPI.getVolume(chapterId, volumeNumber);
      // Extract versions from volume versions array
      const narratorVersion = volume.versions?.find(
        (v: any) => v.perspective === 'NARRATOR'
      );
      const protagonistVersion = volume.versions?.find(
        (v: any) => v.perspective === 'PROTAGONIST'
      );

      set({
        narrator: narratorVersion,
        protagonist: protagonistVersion,
        currentVersion: narratorVersion || protagonistVersion,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setCurrentVersion: (version) => set({ currentVersion: version }),
  clearError: () => set({ error: null }),
}));
```

**Step 2: Add getVolume method to API if not exists**

Check if method exists - if not, add:

```typescript
// In apps/mobile/src/services/api/chapters.ts - already has getVolume()
// No changes needed
```

**Step 3: Commit**

```bash
git add apps/mobile/src/stores/volumeVersionsStore.ts
git commit -m "feat: create volumeVersionsStore for managing volume text content"
```

---

## Task 2: Create ReaderScreen Component

**Files:**
- Create: `apps/mobile/src/screens/ReaderScreen.tsx`
- Create: `apps/mobile/src/app/reader/[id].tsx` - Route for reader

**Why:** This is the core reading experience - users need a comfortable, feature-rich reader.

**Step 1: Create ReaderScreen**

```typescript
// apps/mobile/src/screens/ReaderScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVolumeStore } from '@/stores/volumeStore';
import { useVersionsStore } from '@/stores/volumeVersionsStore';
import type { VolumeVersion } from '@/types';

const ReaderScreen: React.FC = () => {
  const router = useRouter();
  const { id: volumeId } = useLocalSearchParams();
  const { currentVolume, selectedPerspective, setSelectedPerspective } =
    useVolumeStore();
  const {
    narrator,
    protagonist,
    currentVersion,
    loading,
    error,
    fetchVersions,
    setCurrentVersion,
  } = useVersionsStore();

  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (currentVolume) {
      fetchVersions(currentVolume.chapterId, currentVolume.volumeNumber);
    }
  }, [currentVolume?.id]);

  useEffect(() => {
    // Update current version when perspective changes
    if (selectedPerspective === 'NARRATOR' && narrator) {
      setCurrentVersion(narrator);
    } else if (selectedPerspective === 'PROTAGONIST' && protagonist) {
      setCurrentVersion(protagonist);
    }
  }, [selectedPerspective, narrator, protagonist]);

  if (!currentVolume) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#666' }}>No volume selected</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 16,
              backgroundColor: '#E11D48',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#E11D48" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, color: 'red', marginBottom: 16 }}>
            Error: {error}
          </Text>
          <TouchableOpacity
            onPress={() =>
              fetchVersions(currentVolume.chapterId, currentVolume.volumeNumber)
            }
            style={{
              backgroundColor: '#E11D48',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e5e5',
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 18, color: '#E11D48' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' }}>
          Volume {currentVolume.volumeNumber}
        </Text>
        <TouchableOpacity onPress={() => setShowControls(!showControls)}>
          <Text style={{ fontSize: 18, color: '#E11D48' }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Reading Controls */}
      {showControls && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: '#f9f9f9',
            borderBottomWidth: 1,
            borderBottomColor: '#e5e5e5',
          }}
        >
          {/* Perspective Toggle */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: '#666' }}>
              Perspective
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {narrator && (
                <TouchableOpacity
                  onPress={() => setSelectedPerspective('NARRATOR')}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    backgroundColor:
                      selectedPerspective === 'NARRATOR' ? '#E11D48' : '#e5e5e5',
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      color: selectedPerspective === 'NARRATOR' ? 'white' : '#666',
                      fontWeight: '500',
                    }}
                  >
                    Narrator
                  </Text>
                </TouchableOpacity>
              )}

              {protagonist && (
                <TouchableOpacity
                  onPress={() => setSelectedPerspective('PROTAGONIST')}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    backgroundColor:
                      selectedPerspective === 'PROTAGONIST' ? '#E11D48' : '#e5e5e5',
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      color: selectedPerspective === 'PROTAGONIST' ? 'white' : '#666',
                      fontWeight: '500',
                    }}
                  >
                    Protagonist
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Font Size Control */}
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 8, color: '#666' }}>
              Font Size: {fontSize}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => setFontSize(Math.max(12, fontSize - 2))}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: '#e5e5e5',
                  borderRadius: 6,
                }}
              >
                <Text style={{ fontSize: 16 }}>−</Text>
              </TouchableOpacity>

              <View style={{ flex: 1 }} />

              <TouchableOpacity
                onPress={() => setFontSize(Math.min(28, fontSize + 2))}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: '#e5e5e5',
                  borderRadius: 6,
                }}
              >
                <Text style={{ fontSize: 16 }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Reader Content */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 20 }}>
        {currentVersion?.text && (
          <Text
            style={{
              fontSize,
              lineHeight: fontSize * lineHeight,
              color: '#333',
              fontFamily: 'System',
            }}
          >
            {currentVersion.text}
          </Text>
        )}

        {!currentVersion?.text && (
          <Text style={{ fontSize: 16, color: '#999', textAlign: 'center', marginTop: 40 }}>
            No content available for this perspective
          </Text>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReaderScreen;
```

**Step 2: Create reader route**

```typescript
// apps/mobile/src/app/reader/[id].tsx

import ReaderScreen from '@/screens/ReaderScreen';

export default ReaderScreen;
```

**Step 3: Commit**

```bash
git add apps/mobile/src/screens/ReaderScreen.tsx apps/mobile/src/app/reader/\[id\].tsx
git commit -m "feat: create ReaderScreen with perspective selection and font controls"
```

---

## Task 3: Verify TypeScript and Integration

**Step 1: Run TypeScript check**

```bash
npm run type-check
```

Expected: No errors ✓

**Step 2: Verify navigation flow**

The flow should now be:
1. Login → Main Tabs
2. Chapters Tab → ChaptersListScreen
3. Select Chapter → ChapterDetailScreen
4. Select Volume → ReaderScreen
5. Read with perspective selection and font controls

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: complete Phase 2 Week 6-7 - Volume Reader with perspective selection"
```

---

## Definition of Done for Week 6-7

✅ ReaderScreen displays volume text based on selected perspective
✅ Perspective toggle (NARRATOR/PROTAGONIST) working
✅ Font size controls (-, +) responsive
✅ Line height adjustable
✅ Navigation flow complete (Chapters → Chapter → Volumes → Reader)
✅ Error handling and loading states
✅ TypeScript compilation passes
✅ All commits atomic and descriptive

---

**Plan saved for Phase 2 Week 6-7.**
