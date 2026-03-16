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

const ReaderScreen: React.FC = () => {
  const router = useRouter();
  const { id: _volumeId } = useLocalSearchParams();
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
  const [showControls, setShowControls] = useState(true);
  const lineHeight = 1.6;

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
          Vol {currentVolume.volumeNumber}
        </Text>
        <TouchableOpacity onPress={() => setShowControls(!showControls)}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
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
        {currentVersion && (currentVersion as any).text && (
          <Text
            style={{
              fontSize,
              lineHeight: fontSize * lineHeight,
              color: '#333',
            }}
          >
            {(currentVersion as any).text}
          </Text>
        )}

        {!currentVersion || !(currentVersion as any).text && (
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
