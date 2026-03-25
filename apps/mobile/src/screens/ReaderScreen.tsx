import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Dimensions,
  Linking,
  Animated,
  Modal,
  Pressable,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chaptersAPI, clubInfoAPI, type VolumeText } from '@/services/api/chapters';
import api from '@/services/api/client';
import Icon from '@/components/Icon';
import PaywallCard from '@/components/PaywallCard';
import type { PricingInfo } from '@/components/PaywallCard';
import { colors, spacing, fontSize as fs, borderRadius } from '@/utils/theme';
import { useThemeColors, useTheme } from '@/theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.moncherjournal.com';
const SETTINGS_KEY = 'reader-settings';

type Perspective = 'NARRATOR' | 'PROTAGONIST';

interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  fontFamily: 'serif' | 'sans-serif';
}

const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 17,
  lineHeight: 1.7,
  fontFamily: 'serif',
};

const ReaderScreen: React.FC = () => {
  const router = useRouter();
  const tc = useThemeColors();
  const { isDark, setMode } = useTheme();
  const { id: volumeId, perspective: initialPerspective } = useLocalSearchParams<{
    id: string;
    perspective?: string;
  }>();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Fallback: navigate to chapter detail page
      const chId = volumeData?.chapterId;
      if (chId) {
        router.replace(`/chapters/${chId}`);
      } else {
        router.replace('/chapters');
      }
    }
  };

  const [volumeData, setVolumeData] = useState<VolumeText | null>(null);
  const [perspective, setPerspective] = useState<Perspective>(
    initialPerspective === 'PROTAGONIST' ? 'PROTAGONIST' : 'NARRATOR'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perspectiveError, setPerspectiveError] = useState<string | null>(null);
  const [pricingInfo, setPricingInfo] = useState<PricingInfo | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [activeWaitsCount, setActiveWaitsCount] = useState(0);
  const [bundleDiscountPercent, setBundleDiscountPercent] = useState(25);
  const [hasActiveWaitForVolume, setHasActiveWaitForVolume] = useState(false);

  // Navigation between volumes
  const [chapterVolumes, setChapterVolumes] = useState<any[]>([]);
  const [prevVolumeId, setPrevVolumeId] = useState<string | null>(null);
  const [nextVolumeId, setNextVolumeId] = useState<string | null>(null);

  // Reading session tracking
  const readingSessionId = useRef<string | null>(null);
  const heartbeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Preload cache for adjacent volumes
  const volumeCache = useRef<Map<string, VolumeText>>(new Map());
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollRef = useRef<ScrollView>(null);

  // Reading settings (persisted)
  const [readerFontSize, setReaderFontSize] = useState(DEFAULT_SETTINGS.fontSize);
  const [lineHeight, setLineHeight] = useState(DEFAULT_SETTINGS.lineHeight);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans-serif'>(DEFAULT_SETTINGS.fontFamily);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHeader, setShowHeader] = useState(true);

  // Progress
  const [progress, setProgress] = useState(0);
  const lastProgressSent = useRef(0);
  const progressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = useRef(0);

  const isProtagonist = perspective === 'PROTAGONIST';
  const accentColor = isProtagonist ? '#E11D48' : colors.gold;

  // Load persisted settings on mount
  useEffect(() => {
    clubInfoAPI.get().then(info => setBundleDiscountPercent(info.discountPercent)).catch(() => {});
  }, []);

  // Reading session heartbeat: track time spent reading
  useEffect(() => {
    if (!volumeData) return;

    // Start reading session
    api.post('/reader/reading-session/start', {
      chapterId: volumeData.chapterId,
      volumeNumber: volumeData.volumeNumber,
      perspective: volumeData.perspective,
    }).then((res: any) => {
      readingSessionId.current = res.data?.data?.sessionId || null;
    }).catch(() => {});

    // Send heartbeat every 30 seconds
    heartbeatInterval.current = setInterval(() => {
      if (readingSessionId.current) {
        api.post('/reader/reading-session/heartbeat', {
          sessionId: readingSessionId.current,
          elapsedSeconds: 10,
          progress: 0, // scroll progress would need to be tracked separately
        }).catch(() => {});
      }
    }, 10000);

    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = null;
      }
      readingSessionId.current = null;
    };
  }, [volumeData?.chapterId, volumeData?.volumeNumber, volumeData?.perspective]);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((raw) => {
      if (raw) {
        try {
          const saved: ReaderSettings = JSON.parse(raw);
          setReaderFontSize(saved.fontSize ?? DEFAULT_SETTINGS.fontSize);
          setLineHeight(saved.lineHeight ?? DEFAULT_SETTINGS.lineHeight);
          setFontFamily(saved.fontFamily ?? DEFAULT_SETTINGS.fontFamily);
        } catch {
          /* ignore corrupt data */
        }
      }
      setSettingsLoaded(true);
    });
  }, []);

  // Fetch active waits count when paywall is shown
  const fetchActiveWaits = useCallback(async (volNumber?: number, chapId?: string) => {
    try {
      const response = await api.get<{ data: any[] }>('/wait/active');
      const waits = response.data.data || [];
      setActiveWaitsCount(waits.length);
      // Check if there's already an active wait for this specific volume
      if (volNumber && chapId) {
        const hasWait = waits.some(
          (w: any) => w.chapterId === chapId && w.volumeNumber === volNumber
        );
        setHasActiveWaitForVolume(hasWait);
      }
    } catch {
      // Silently fail - defaults to 0
    }
  }, []);

  // Preload a volume into cache (fire-and-forget)
  const preloadVolume = useCallback(async (volId: string, persp: Perspective) => {
    if (volumeCache.current.has(`${volId}-${persp}`)) return;
    try {
      const data = await chaptersAPI.getVolumeText(volId, persp);
      volumeCache.current.set(`${volId}-${persp}`, data);
    } catch {
      // Preload failed (403 etc) - will be handled when user navigates
    }
  }, []);

  // Fetch sibling volumes for prev/next navigation + preload adjacent
  useEffect(() => {
    if (!volumeData?.chapterId || !volumeData?.volumeNumber) return;
    const perspKey = perspective;
    const fetchSiblings = async () => {
      try {
        const chapter = await chaptersAPI.getChapter(volumeData.chapterId);
        const vols = (chapter.volumes || [])
          .filter((v: any) => v.status === 'PUBLISHED')
          .sort((a: any, b: any) => a.volumeNumber - b.volumeNumber);
        setChapterVolumes(vols);

        const currentNum = volumeData.volumeNumber;

        const prevVols = vols.filter((v: any) => v.volumeNumber < currentNum);
        const prevAccessible = [...prevVols]
          .reverse()
          .find((v: any) => v.accessByPerspective?.[perspKey]?.isAccessible);

        const nextVols = vols.filter((v: any) => v.volumeNumber > currentNum);
        const nextAccessible = nextVols.find(
          (v: any) => v.accessByPerspective?.[perspKey]?.isAccessible
        );
        const nextAny = nextVols[0];

        const prevId = prevAccessible?.id || null;
        const nextId = nextAccessible?.id || nextAny?.id || null;
        setPrevVolumeId(prevId);
        setNextVolumeId(nextId);

        // Preload adjacent volumes in background (staggered)
        if (nextId) setTimeout(() => preloadVolume(nextId, perspKey), 300);
        if (prevId) setTimeout(() => preloadVolume(prevId, perspKey), 600);
      } catch {
        // Nav buttons just won't show
      }
    };
    fetchSiblings();
  }, [volumeData?.chapterId, volumeData?.volumeNumber, perspective, preloadVolume]);

  // Persist settings whenever they change
  useEffect(() => {
    if (!settingsLoaded) return;
    const settings: ReaderSettings = { fontSize: readerFontSize, lineHeight, fontFamily };
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [readerFontSize, lineHeight, fontFamily, settingsLoaded]);

  // Fetch chapter pricing info when access is denied
  // Mirrors pricing logic from apps/web PurchaseDrawer + ProtagonistPurchaseDrawer
  const fetchPricingInfo = useCallback(
    async (chapterId: string, volumeNum: number, persp: Perspective) => {
      try {
        const chapter = await chaptersAPI.getChapter(chapterId);
        const volumes = chapter.volumes || [];
        const volume = volumes.find((v: any) => v.volumeNumber === volumeNum);
        const access = volume?.accessByPerspective?.[persp];
        const pricing = (chapter as any).pricing;
        const blockageType = access?.blockageType || null;

        let volumePrice = 0;
        let chapterBundlePrice = 0;

        if (persp === 'PROTAGONIST') {
          // -- PROTAGONIST pricing (from ProtagonistPurchaseDrawer) --
          // Single volume = priceProtagonistUnlock (fixed per volume, default 0.99€)
          volumePrice = pricing?.priceProtagonistUnlock ?? 99;

          // Chapter bundle = sum of all non-accessible protagonist volumes * price with config discount
          let totalProtaPrice = 0;
          volumes.forEach((vol: any) => {
            const protaAccess = vol.accessByPerspective?.PROTAGONIST;
            if (!protaAccess?.isAccessible) {
              totalProtaPrice += volumePrice;
            }
          });
          chapterBundlePrice = Math.round(totalProtaPrice * (1 - bundleDiscountPercent / 100));
        } else {
          // -- NARRATOR pricing (from PurchaseDrawer.getVolumePriceByNumber) --
          if (volumeNum <= 8) {
            volumePrice = pricing?.priceFreeToRead ?? 0;
          } else if (volumeNum <= 10) {
            volumePrice = pricing?.pricePaywall ?? 0;
          } else {
            volumePrice = pricing?.priceEpilogue ?? 0;
          }

          // Chapter bundle = bundleDiscountedPrice (already computed by backend)
          chapterBundlePrice = pricing?.bundleDiscountedPrice || pricing?.bundleOriginalPrice || 0;
        }

        setPricingInfo({
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          volumeNumber: volumeNum,
          volumeTitle: (volume as any)?.title || '',
          volumePrice,
          chapterBundlePrice,
          blockageType,
          perspective: persp,
        });
      } catch (e) {
        console.warn('fetchPricingInfo failed:', e);
        setPricingInfo({
          chapterId,
          chapterTitle: '',
          volumeNumber: volumeNum,
          volumeTitle: '',
          volumePrice: 0,
          chapterBundlePrice: 0,
          blockageType: null,
          perspective: persp,
        });
      }
      setShowPaywall(true);
      // Fetch active waits to show counter and enforce limit
      await fetchActiveWaits(volumeNum, chapterId);
    },
    [fetchActiveWaits]
  );

  // Helper: check if error is an access denied (403)
  const isAccessDenied = (err: any): boolean => {
    if (err.statusCode === 403) return true;
    if (err.code === 'ENTITLEMENT_DENIED') return true;
    if (err.response?.status === 403) return true;
    if (err.code === 'NO_ACCESS') return true;
    return false;
  };

  // Extract volume metadata from 403 error context (no content, but has title/cover/etc)
  const extractVolumeInfo = (err: any): VolumeText | null => {
    const ctx = err.context || err.response?.data?.data;
    if (!ctx?.chapterId || !ctx?.volumeNumber) return null;
    return {
      id: ctx.id || '',
      volumeId: ctx.volumeId || '',
      title: ctx.title || '',
      chapterId: ctx.chapterId,
      chapterTitle: ctx.chapterTitle || '',
      volumeNumber: ctx.volumeNumber,
      perspective: ctx.perspective || '',
      content: '', // No content - access denied
      illustrationUrl: ctx.illustrationUrl || null,
    };
  };

  // Core fetch function - returns the data or throws
  const doFetch = async (persp: Perspective): Promise<VolumeText> => {
    return chaptersAPI.getVolumeText(volumeId!, persp);
  };

  // Was a perspective explicitly requested via URL param?
  const wasExplicitPerspective = !!initialPerspective;

  // Initial load: if perspective was explicitly chosen, show paywall on 403 (no fallback)
  // If no explicit choice, try fallback to the other perspective
  const initialLoad = useCallback(async () => {
    if (!volumeId) return;
    setLoading(true);
    setError(null);
    setPricingInfo(null);
    setShowPaywall(false);

    try {
      const data = await doFetch(perspective);
      setVolumeData(data);
    } catch (err: any) {
      if (isAccessDenied(err)) {
        const volInfo = extractVolumeInfo(err);

        if (wasExplicitPerspective) {
          // User explicitly chose this perspective -> show paywall, don't fallback
          if (volInfo) setVolumeData(volInfo);

          const chId = volInfo?.chapterId;
          const volNum = volInfo?.volumeNumber;
          if (chId && volNum) {
            await fetchPricingInfo(chId, volNum, perspective);
          } else {
            await findChapterAndShowPaywall(perspective);
          }
        } else {
          // No explicit choice -> try fallback perspective
          const fallback: Perspective = perspective === 'PROTAGONIST' ? 'NARRATOR' : 'PROTAGONIST';
          try {
            const data = await doFetch(fallback);
            setVolumeData(data);
            setPerspective(fallback);
            setPerspectiveError(
              `La perspective ${perspective === 'PROTAGONIST' ? 'Protagoniste' : 'Narrateur'} n'est pas disponible`
            );
          } catch (fallbackErr: any) {
            // Both failed - show paywall
            const info = volInfo || extractVolumeInfo(fallbackErr);
            if (info) setVolumeData(info);

            const chId = info?.chapterId || volInfo?.chapterId;
            const volNum = info?.volumeNumber || volInfo?.volumeNumber;
            if (chId && volNum) {
              await fetchPricingInfo(chId, volNum, perspective);
            } else {
              await findChapterAndShowPaywall(perspective);
            }
          }
        }
      } else {
        setError(err.userMessage || err.message || 'Erreur de chargement');
      }
    } finally {
      setLoading(false);
    }
  }, [volumeId, perspective, fetchPricingInfo, wasExplicitPerspective]);

  // Find the chapter that owns this volume and show the paywall
  const findChapterAndShowPaywall = async (persp: Perspective) => {
    try {
      const chapters = await chaptersAPI.getChapters();
      for (const ch of chapters) {
        const full = await chaptersAPI.getChapter(ch.id);
        const vol = full.volumes?.find((v: any) => v.id === volumeId);
        if (vol) {
          await fetchPricingInfo(ch.id, vol.volumeNumber, persp);
          return;
        }
      }
    } catch {
      // Last resort - generic paywall
    }
    setShowPaywall(true);
  };

  useEffect(() => {
    initialLoad();
  }, [volumeId]);

  // Explicit perspective change: show paywall if 403, never silently fallback
  const handlePerspectiveChange = async (persp: Perspective) => {
    if (persp === perspective) return;

    // Save current data BEFORE clearing state
    const prevChapterId = volumeData?.chapterId;
    const prevVolumeNumber = volumeData?.volumeNumber;

    setPerspective(persp);
    setPerspectiveError(null);
    setPricingInfo(null);
    setShowPaywall(false);
    setLoading(true);

    try {
      const data = await doFetch(persp);
      setVolumeData(data);
    } catch (err: any) {
      if (isAccessDenied(err)) {
        // Extract volume info from 403 (title, cover, volumeNumber)
        const volInfo = extractVolumeInfo(err);

        // Set volume metadata (no content) so header/title/cover still display
        if (volInfo) {
          setVolumeData(volInfo);
        } else {
          setVolumeData(null);
        }

        const chId = volInfo?.chapterId || prevChapterId;
        const volNum = volInfo?.volumeNumber || prevVolumeNumber;

        if (chId && volNum) {
          await fetchPricingInfo(chId, volNum, persp);
        } else {
          await findChapterAndShowPaywall(persp);
        }
      } else {
        setError(err.userMessage || err.message || 'Erreur de chargement');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseVolume = async () => {
    if (!pricingInfo || purchaseLoading) return;
    setPurchaseLoading(true);
    try {
      const isProta = pricingInfo.perspective === 'PROTAGONIST';
      const endpoint = isProta
        ? '/stripe/create-protagonist-checkout-session'
        : '/stripe/create-checkout-session';

      const body: any = {
        chapterId: pricingInfo.chapterId,
        type: 'VOLUME',
        volumeNumber: pricingInfo.volumeNumber,
        successUrl: `${API_BASE_URL}/mobile-payment-success`,
        cancelUrl: `${API_BASE_URL}/mobile-payment-cancel`,
      };
      if (!isProta) {
        body.scopes = ['BASE'];
      }

      const response = await api.post<{ data: { url: string } }>(endpoint, body);
      const checkoutUrl = response.data.data?.url || (response.data as any).url;
      if (checkoutUrl) {
        await Linking.openURL(checkoutUrl);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la creation du paiement');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handlePurchaseChapter = async () => {
    if (!pricingInfo || purchaseLoading) return;
    setPurchaseLoading(true);
    try {
      const isProta = pricingInfo.perspective === 'PROTAGONIST';
      const endpoint = isProta
        ? '/stripe/create-protagonist-checkout-session'
        : '/stripe/create-checkout-session';

      const body: any = {
        chapterId: pricingInfo.chapterId,
        type: 'CHAPTER',
        successUrl: `${API_BASE_URL}/mobile-payment-success`,
        cancelUrl: `${API_BASE_URL}/mobile-payment-cancel`,
      };
      if (!isProta) {
        body.scopes = ['BASE'];
      }

      const response = await api.post<{ data: { url: string } }>(endpoint, body);
      const checkoutUrl = response.data.data?.url || (response.data as any).url;
      if (checkoutUrl) {
        await Linking.openURL(checkoutUrl);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la creation du paiement');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const [waitLoading, setWaitLoading] = useState(false);

  const handleStartWait = async () => {
    if (!pricingInfo || waitLoading) return;
    setWaitLoading(true);
    try {
      await api.post('/wait/start', {
        chapterId: pricingInfo.chapterId,
        volumeNumber: pricingInfo.volumeNumber,
      });
      // Refresh waits count and mark this volume as having an active wait
      setActiveWaitsCount((prev) => prev + 1);
      setHasActiveWaitForVolume(true);
      setWaitLoading(false);
      setPerspectiveError('Compte a rebours demarre ! Le volume sera accessible dans 24h.');
    } catch (err: any) {
      const msg = err.userMessage || err.message || 'Erreur lors du demarrage du timer';
      setError(msg);
      setWaitLoading(false);
    }
  };

  // Send progress to API (debounced, 5% threshold, 2s delay - same as web)
  const sendProgressToApi = useCallback(
    (pct: number) => {
      if (!volumeData?.chapterId || !volumeData?.volumeNumber) return;
      const diff = pct - lastProgressSent.current;
      if (diff < 5 && pct < 100) return;

      if (progressTimeout.current) clearTimeout(progressTimeout.current);
      progressTimeout.current = setTimeout(async () => {
        try {
          await api.post('/reader/update-progress', {
            chapterId: volumeData.chapterId,
            volumeNumber: volumeData.volumeNumber,
            progress: pct,
            perspective: perspective,
          });
          lastProgressSent.current = pct;
        } catch {
          // Silently fail - progress is best-effort
        }
      }, 2000);
    },
    [volumeData?.chapterId, volumeData?.volumeNumber, perspective]
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      const maxScroll = contentSize.height - layoutMeasurement.height;
      if (maxScroll <= 0) return;
      const pct = Math.min(100, Math.max(0, (contentOffset.y / maxScroll) * 100));
      const rounded = Math.round(pct);
      setProgress(rounded);
      sendProgressToApi(rounded);
    },
    [sendProgressToApi]
  );

  // Cleanup progress timeout on unmount
  useEffect(() => {
    return () => {
      if (progressTimeout.current) clearTimeout(progressTimeout.current);
    };
  }, []);

  const navigateToVolume = async (volId: string) => {
    // Flush pending progress
    if (progressTimeout.current) clearTimeout(progressTimeout.current);
    lastProgressSent.current = 0;

    const cacheKey = `${volId}-${perspective}`;
    const cached = volumeCache.current.get(cacheKey);

    if (cached) {
      // Cached: fade out → swap content → fade in (no loading screen)
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setVolumeData(cached);
        setShowPaywall(false);
        setPricingInfo(null);
        setPerspectiveError(null);
        setError(null);
        setProgress(0);
        scrollRef.current?.scrollTo({ y: 0, animated: false });

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Not cached: reset and fetch fresh (shows loading)
      setVolumeData(null);
      setShowPaywall(false);
      setPricingInfo(null);
      setPerspectiveError(null);
      setError(null);
      setProgress(0);
      setPrevVolumeId(null);
      setNextVolumeId(null);
      setLoading(true);

      try {
        const data = await chaptersAPI.getVolumeText(volId, perspective);
        setVolumeData(data);
      } catch (err: any) {
        if (isAccessDenied(err)) {
          const volInfo = extractVolumeInfo(err);
          if (volInfo) setVolumeData(volInfo);
          const chId = volInfo?.chapterId;
          const volNum = volInfo?.volumeNumber;
          if (chId && volNum) {
            await fetchPricingInfo(chId, volNum, perspective);
          } else {
            setShowPaywall(true);
          }
        } else {
          setError(err.userMessage || err.message || 'Erreur de chargement');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleContentTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) return;
    lastTap.current = now;
    setShowHeader(!showHeader);
    setShowSettings(false);
  };

  const coverUrl = volumeData?.illustrationUrl
    ? volumeData.illustrationUrl.startsWith('http')
      ? volumeData.illustrationUrl
      : `${API_BASE_URL}${volumeData.illustrationUrl}`
    : null;

  const paragraphs = volumeData?.content?.split('\n\n').filter(Boolean) || [];
  const hasContent = paragraphs.length > 0;

  const fontFamilyStyle = fontFamily === 'serif' ? 'Newsreader_400Regular' : undefined;

  // --- Loading state ---
  if (loading && !volumeData) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: tc.background }]}>
        <StatusBar barStyle={tc.background === '#f5f3f0' ? 'dark-content' : 'light-content'} />
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={styles.loadingText}>Chargement du volume...</Text>
      </SafeAreaView>
    );
  }

  // Volume info for header (from volumeData or pricingInfo)
  const displayChapterTitle = volumeData?.chapterTitle || pricingInfo?.chapterTitle || '';
  const displayVolumeTitle = volumeData?.title || '';
  const displayVolumeNumber = volumeData?.volumeNumber || pricingInfo?.volumeNumber;

  // --- Generic error (not 403) ---
  if (error && !volumeData && !hasContent && !showPaywall) {
    return (
      <SafeAreaView style={[styles.errorContainer, { backgroundColor: tc.background }]}>
        <StatusBar barStyle={tc.background === '#f5f3f0' ? 'dark-content' : 'light-content'} />
        <Icon name="error" size={48} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => initialLoad()}>
          <Text style={styles.retryText}>Reessayer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => goBack()}>
          <Text style={styles.backLinkText}>Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // --- Unified Reader (content OR paywall inline) ---
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tc.background }, isProtagonist && styles.containerProtagonist]}>
      <StatusBar barStyle={tc.background === '#f5f3f0' ? 'dark-content' : 'light-content'} />

      {/* Header */}
      {showHeader && (
        <View style={[styles.header, { backgroundColor: tc.headerBg, borderBottomColor: tc.separator }, isProtagonist && styles.headerProtagonist]}>
          <TouchableOpacity onPress={() => goBack()} style={styles.headerButton}>
            <Icon
              name="arrow_back"
              size={22}
              color={isProtagonist ? tc.rose : tc.text}
            />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text
              style={[styles.headerTitle, { color: tc.text }, isProtagonist && styles.headerTitleProtagonist]}
              numberOfLines={1}
            >
              {isProtagonist ? 'Point de vue intime' : 'Cher Journal'}
            </Text>
            <Text style={[styles.headerSubtitle, { color: tc.textSecondary }]} numberOfLines={1}>
              {displayVolumeNumber ? `Vol. ${displayVolumeNumber}` : ''}
              {displayVolumeTitle
                ? ` — ${displayVolumeTitle}`
                : displayChapterTitle
                  ? ` — ${displayChapterTitle}`
                  : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowSettings(!showSettings)}
            style={styles.headerButton}
          >
            <Icon name="tune" size={22} color={isProtagonist ? tc.rose : tc.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Settings Bottom Drawer */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <Pressable style={styles.drawerOverlay} onPress={() => setShowSettings(false)}>
          <Pressable
            style={[styles.drawerContent, { backgroundColor: tc.card }, isProtagonist && { backgroundColor: '#FFF0F3' }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <View style={styles.drawerHandle}>
              <View style={[styles.drawerHandleBar, { backgroundColor: tc.separator }]} />
            </View>

            <Text style={[styles.drawerTitle, { color: tc.text }]}>Parametres de lecture</Text>

            {/* Perspective */}
            <View style={styles.settingsRow}>
              <Text style={[styles.settingsLabel, { color: tc.textSecondary }]}>Perspective</Text>
              <View style={[styles.perspectiveToggle, { backgroundColor: tc.surfaceSecondary }]}>
                <TouchableOpacity
                  style={[styles.perspectiveBtn, { backgroundColor: tc.surfaceSecondary }, perspective === 'NARRATOR' && { backgroundColor: tc.gold }]}
                  onPress={() => handlePerspectiveChange('NARRATOR')}
                >
                  <Text style={[styles.perspectiveBtnText, { color: tc.textSecondary }, perspective === 'NARRATOR' && { color: '#FFFFFF' }]}>
                    Narrateur
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.perspectiveBtn, { backgroundColor: tc.surfaceSecondary }, perspective === 'PROTAGONIST' && { backgroundColor: tc.rose }]}
                  onPress={() => handlePerspectiveChange('PROTAGONIST')}
                >
                  <Text style={[styles.perspectiveBtnText, { color: tc.textSecondary }, perspective === 'PROTAGONIST' && { color: '#FFFFFF' }]}>
                    Protagoniste
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Font size */}
            <View style={styles.settingsRow}>
              <Text style={[styles.settingsLabel, { color: tc.textSecondary }]}>Taille ({readerFontSize})</Text>
              <View style={styles.settingsControls}>
                <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: tc.surfaceSecondary }]} onPress={() => setReaderFontSize(Math.max(13, readerFontSize - 1))}>
                  <Text style={[styles.settingsBtnText, { color: tc.text }]}>A-</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: tc.surfaceSecondary }]} onPress={() => setReaderFontSize(Math.min(26, readerFontSize + 1))}>
                  <Text style={[styles.settingsBtnText, { color: tc.text }]}>A+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Line height */}
            <View style={styles.settingsRow}>
              <Text style={[styles.settingsLabel, { color: tc.textSecondary }]}>Interligne ({lineHeight.toFixed(1)})</Text>
              <View style={styles.settingsControls}>
                <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: tc.surfaceSecondary }]} onPress={() => setLineHeight(Math.max(1.3, +(lineHeight - 0.1).toFixed(1)))}>
                  <Icon name="remove" size={16} color={tc.text} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: tc.surfaceSecondary }]} onPress={() => setLineHeight(Math.min(2.5, +(lineHeight + 0.1).toFixed(1)))}>
                  <Icon name="add" size={16} color={tc.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Font family */}
            <View style={styles.settingsRow}>
              <Text style={[styles.settingsLabel, { color: tc.textSecondary }]}>Police</Text>
              <View style={styles.settingsControls}>
                <TouchableOpacity
                  style={[styles.fontBtn, { borderColor: tc.cardBorder, backgroundColor: tc.surfaceSecondary }, fontFamily === 'serif' && styles.fontBtnActive]}
                  onPress={() => setFontFamily('serif')}
                >
                  <Text style={[styles.fontBtnText, { color: tc.text }, { fontFamily: 'Newsreader_400Regular' }]}>Serif</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.fontBtn, { borderColor: tc.cardBorder, backgroundColor: tc.surfaceSecondary }, fontFamily === 'sans-serif' && styles.fontBtnActive]}
                  onPress={() => setFontFamily('sans-serif')}
                >
                  <Text style={[styles.fontBtnText, { color: tc.text }]}>Sans</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Theme */}
            <View style={[styles.settingsRow, { marginBottom: 0 }]}>
              <Text style={[styles.settingsLabel, { color: tc.textSecondary }]}>Theme</Text>
              <View style={styles.settingsControls}>
                <TouchableOpacity
                  style={[styles.fontBtn, { borderColor: tc.cardBorder, backgroundColor: tc.surfaceSecondary }, !isDark && styles.fontBtnActive]}
                  onPress={() => setMode('light')}
                >
                  <Icon name="light_mode" size={16} color={!isDark ? '#FFFFFF' : tc.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.fontBtn, { borderColor: tc.cardBorder, backgroundColor: tc.surfaceSecondary }, isDark && styles.fontBtnActive]}
                  onPress={() => setMode('dark')}
                >
                  <Icon name="dark_mode" size={16} color={isDark ? '#FFFFFF' : tc.text} />
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Perspective Error Banner */}
      {perspectiveError && (
        <View style={[styles.perspectiveErrorBanner, { backgroundColor: tc.card, borderBottomColor: tc.separator }]}>
          <Icon name="info" size={16} color={tc.gold} />
          <Text style={[styles.perspectiveErrorText, { color: tc.textSecondary }]}>{perspectiveError}</Text>
          <TouchableOpacity onPress={() => setPerspectiveError(null)}>
            <Icon name="close" size={16} color={tc.textTertiary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={500}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity activeOpacity={1} onPress={handleContentTap}>
            {/* Volume Header (always shown) */}
            <View style={styles.volumeHeader}>
              <Text style={[styles.chapterTitle, isProtagonist && { color: colors.rose }]}>
                {displayChapterTitle}
              </Text>
              <View style={[styles.headerDivider, { backgroundColor: accentColor }]} />
              {displayVolumeTitle ? (
                <Text style={styles.volumeTitle}>{displayVolumeTitle}</Text>
              ) : null}
              {displayVolumeNumber ? (
                <Text style={styles.volumeNumber}>Volume {displayVolumeNumber}</Text>
              ) : null}
            </View>

            {/* === PAYWALL (inline, replaces content) === */}
            {showPaywall && !hasContent ? (
              <PaywallCard
                perspective={perspective}
                pricingInfo={pricingInfo}
                purchaseLoading={purchaseLoading}
                waitLoading={waitLoading}
                activeWaitsCount={activeWaitsCount}
                maxWaitsAllowed={2}
                hasActiveWaitForVolume={hasActiveWaitForVolume}
                onPurchaseVolume={handlePurchaseVolume}
                onPurchaseChapter={handlePurchaseChapter}
                onStartWait={handleStartWait}
              />
            ) : (
              /* === NORMAL CONTENT === */
              <>
                {coverUrl && (
                  <View style={styles.coverContainer}>
                    <Image
                      source={{ uri: coverUrl }}
                      style={styles.coverImage}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={300}
                    />
                  </View>
                )}

                <View style={styles.textContainer}>
                  {paragraphs.map((para, idx) => (
                    <React.Fragment key={idx}>
                      {idx === 0 ? (
                        /* First paragraph with drop cap */
                        <Text
                          style={[
                            styles.paragraph,
                            styles.firstParagraph,
                            {
                              color: tc.text,
                              fontSize: readerFontSize,
                              lineHeight: readerFontSize * lineHeight,
                              ...(fontFamilyStyle ? { fontFamily: fontFamilyStyle } : {}),
                            },
                          ]}
                        >
                          <Text style={[styles.dropCap, { color: accentColor }]}>
                            {para.charAt(0)}
                          </Text>
                          {para.slice(1)}
                        </Text>
                      ) : (
                        <Text
                          style={[
                            styles.paragraph,
                            {
                              color: tc.text,
                              fontSize: readerFontSize,
                              lineHeight: readerFontSize * lineHeight,
                              ...(fontFamilyStyle ? { fontFamily: fontFamilyStyle } : {}),
                            },
                          ]}
                        >
                          {para}
                        </Text>
                      )}
                      {idx > 0 && (idx + 1) % 5 === 0 && idx < paragraphs.length - 1 && (
                        <View style={styles.paragraphDivider}>
                          <View
                            style={[styles.dividerLine, { backgroundColor: `${accentColor}40` }]}
                          />
                          <Icon
                            name={isProtagonist ? 'favorite' : 'auto_stories'}
                            size={16}
                            color={`${accentColor}60`}
                          />
                          <View
                            style={[styles.dividerLine, { backgroundColor: `${accentColor}40` }]}
                          />
                        </View>
                      )}
                    </React.Fragment>
                  ))}
                </View>

                {paragraphs.length > 0 && (
                  <View style={styles.endSection}>
                    <View style={[styles.endDivider, { backgroundColor: `${accentColor}30` }]} />
                    <Icon name="auto_stories" size={28} color={`${accentColor}80`} />
                    <Text style={[styles.endText, { color: `${accentColor}CC` }]}>
                      Fin du volume {volumeData?.volumeNumber}
                    </Text>
                    <TouchableOpacity
                      style={[styles.endButton, { borderColor: accentColor }]}
                      onPress={() => goBack()}
                    >
                      <Text style={[styles.endButtonText, { color: accentColor }]}>
                        Retour au chapitre
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {paragraphs.length === 0 && !loading && !showPaywall && (
                  <View style={styles.noContent}>
                    <Icon name="lock" size={40} color={colors.gray[400]} />
                    <Text style={styles.noContentText}>
                      Contenu non disponible pour cette perspective
                    </Text>
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* Bottom Navigation Bar */}
      {!showPaywall && (
        <View
          style={[
            styles.navBar,
            { borderTopColor: `${accentColor}20`, marginBottom: spacing['4xl'] },
          ]}
        >
          {/* Prev button */}
          {prevVolumeId ? (
            <TouchableOpacity
              style={[styles.navButton, { borderColor: accentColor }]}
              onPress={() => navigateToVolume(prevVolumeId)}
              activeOpacity={0.7}
            >
              <Icon name="arrow_back" size={16} color={accentColor} />
              <Text style={[styles.navButtonText, { color: accentColor }]}>Precedent</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navButtonPlaceholder} />
          )}

          {/* Progress */}
          <View style={styles.navProgress}>
            <Text style={[styles.navProgressText, { color: `${accentColor}99` }]}>{progress}%</Text>
            <View style={[styles.progressBar, { backgroundColor: `${accentColor}15` }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: accentColor },
                ]}
              />
            </View>
          </View>

          {/* Next button */}
          {nextVolumeId ? (
            <TouchableOpacity
              style={[styles.navButton, { borderColor: accentColor }]}
              onPress={() => navigateToVolume(nextVolumeId)}
              activeOpacity={0.7}
            >
              <Text style={[styles.navButtonText, { color: accentColor }]}>Suivant</Text>
              <Icon name="arrow_forward" size={16} color={accentColor} />
            </TouchableOpacity>
          ) : (
            <View style={styles.navButtonPlaceholder} />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Container
  container: { flex: 1, backgroundColor: '#FFFBF5' },
  containerProtagonist: { backgroundColor: '#FFF5F7' },

  // Loading / Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.boudoir[950],
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: fs.base,
    color: colors.boudoir[200],
    fontFamily: 'Newsreader_400Regular_Italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.boudoir[950],
    paddingHorizontal: spacing['2xl'],
    gap: spacing.lg,
  },
  errorText: { fontSize: fs.base, color: colors.boudoir[200], textAlign: 'center' },
  retryButton: {
    backgroundColor: colors.rose,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  retryText: { color: colors.white, fontSize: fs.base, fontWeight: '600' },
  backLink: { marginTop: spacing.sm },
  backLinkText: { color: colors.boudoir[200], fontSize: fs.sm },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.gold}30`,
    backgroundColor: '#FFFBF5',
    paddingTop: spacing['3xl'],
  },
  headerProtagonist: { borderBottomColor: `${colors.rose}30`, backgroundColor: '#FFF5F7' },
  headerButton: { padding: spacing.sm },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontFamily: 'GreatVibes_400Regular', fontSize: fs['2xl'], color: colors.gold },
  headerTitleProtagonist: { color: colors.rose },
  headerSubtitle: { fontSize: fs.xs, color: colors.gray[500], marginTop: -2 },

  // Settings
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  drawerContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
    paddingTop: spacing.sm,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  drawerHandle: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  drawerHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray[300],
  },
  drawerTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.xl,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  settingsLabel: { fontSize: fs.sm, fontWeight: '600', color: colors.charcoal },
  settingsControls: { flexDirection: 'row', gap: spacing.sm },
  settingsBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    minWidth: 40,
    alignItems: 'center',
  },
  settingsBtnText: { fontSize: fs.sm, fontWeight: '600', color: colors.charcoal },
  perspectiveToggle: { flexDirection: 'row', gap: spacing.sm },
  perspectiveBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
  },
  perspectiveBtnText: { fontSize: fs.sm, fontWeight: '500', color: colors.gray[600] },
  fontBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
  },
  fontBtnActive: { backgroundColor: colors.charcoal },
  fontBtnText: { fontSize: fs.sm, fontWeight: '500', color: colors.charcoal },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: spacing['4xl'] },

  // Volume Header
  volumeHeader: {
    alignItems: 'center',
    paddingTop: spacing['4xl'],
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing['2xl'],
  },
  chapterTitle: {
    fontFamily: 'GreatVibes_400Regular',
    fontSize: fs['4xl'],
    color: colors.gold,
    textAlign: 'center',
  },
  headerDivider: { width: 60, height: 1, marginVertical: spacing.lg },
  volumeTitle: {
    fontFamily: 'Newsreader_400Regular_Italic',
    fontSize: fs.xl,
    color: colors.charcoal,
    textAlign: 'center',
  },
  volumeNumber: {
    fontSize: fs.xs,
    color: colors.gray[400],
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },

  // Cover
  coverContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    paddingHorizontal: spacing['2xl'],
  },
  coverImage: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: borderRadius.lg,
  },

  // Text
  textContainer: { paddingHorizontal: spacing.xl },
  paragraph: { color: colors.charcoal, marginBottom: spacing.lg, textAlign: 'justify' },
  firstParagraph: { marginBottom: spacing.xl },
  dropCap: {
    fontFamily: 'Cinzel_700Bold',
    fontSize: 52,
    lineHeight: 52,
  },
  paragraphDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginVertical: spacing.xl,
  },
  dividerLine: { height: 1, width: 48 },

  // End of Volume
  endSection: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    gap: spacing.md,
    marginBottom: spacing['4xl'],
  },
  endDivider: { width: 80, height: 1, marginBottom: spacing.md },
  endText: { fontFamily: 'Newsreader_400Regular_Italic', fontSize: fs.lg },
  endButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
  },
  endButtonText: { fontSize: fs.base, fontWeight: '600' },

  // No content
  noContent: { alignItems: 'center', paddingVertical: spacing['4xl'], gap: spacing.lg },
  noContentText: { fontSize: fs.base, color: colors.gray[500], textAlign: 'center' },

  // Nav bar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    marginBottom: spacing['4xl'],
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderRadius: borderRadius.full,
  },
  navButtonText: {
    fontSize: fs.xs,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  navButtonPlaceholder: {
    width: 90,
  },
  navProgress: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  navProgressText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },

  // Progress bar
  progressBar: { height: 3, borderRadius: 2, width: '100%' },
  progressFill: { height: 3, borderRadius: 2 },

  // Perspective error banner
  perspectiveErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.2)',
  },
  perspectiveErrorText: { flex: 1, fontSize: fs.sm, color: colors.charcoal },
});

export default ReaderScreen;
