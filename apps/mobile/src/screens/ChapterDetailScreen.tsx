import React, { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useChapterStore } from '@/stores/chapterStore';
import { useVolumeStore } from '@/stores/volumeStore';
import type { Volume } from '@/types';

const ChapterDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { selectedChapter } = useChapterStore();
  const { volumes, loading, error, fetchVolumes, setCurrentVolume } =
    useVolumeStore();

  useEffect(() => {
    if (id) {
      fetchVolumes(id as string);
    }
  }, [id]);

  const handleSelectVolume = (volume: Volume) => {
    setCurrentVolume(volume);
    router.push(`/reader/${volume.id}`);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E11D48" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        {selectedChapter && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 8 }}>
              {selectedChapter.title}
            </Text>
            <Text style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>
              {selectedChapter.protagonistName}
            </Text>
            {selectedChapter.description && (
              <Text style={{ fontSize: 14, color: '#999', lineHeight: 20 }}>
                {selectedChapter.description}
              </Text>
            )}
          </View>
        )}

        {error && (
          <Text style={{ color: 'red', marginBottom: 16, fontSize: 14 }}>
            Error: {error}
          </Text>
        )}

        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 12,
            marginTop: 12,
          }}
        >
          Volumes ({volumes.length})
        </Text>

        {volumes.length === 0 ? (
          <Text style={{ fontSize: 14, color: '#999', marginTop: 12 }}>
            No volumes available
          </Text>
        ) : (
          volumes.map((volume) => (
            <TouchableOpacity
              key={volume.id}
              onPress={() => handleSelectVolume(volume)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#e5e5e5',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', marginBottom: 4 }}>
                Volume {volume.volumeNumber}
              </Text>
              {volume.title && (
                <Text style={{ fontSize: 14, color: '#666' }}>
                  {volume.title}
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ChapterDetailScreen;
