// Bridge file for Expo monorepo entry point resolution.
// expo/AppEntry.js imports ../../App which resolves here from the monorepo root.
// Re-export the actual mobile app entry.
import '@expo/metro-runtime';
import { App } from 'expo-router/build/qualified-entry';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';

renderRootComponent(App);
