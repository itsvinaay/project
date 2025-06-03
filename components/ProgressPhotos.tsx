import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator
} from 'react-native';
import { Camera } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';

interface ProgressPhoto {
  id: string;
  url: string;
  date: string;
}

interface ProgressPhotosProps {
  userId: string;
}

export default function ProgressPhotos({ userId }: ProgressPhotosProps) {
  const theme = useTheme();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Mock data for now - replace with actual API call
        const mockPhotos: ProgressPhoto[] = [
          { id: '1', url: 'https://via.placeholder.com/150', date: '2023-06-01' },
          { id: '2', url: 'https://via.placeholder.com/150', date: '2023-05-15' },
          { id: '3', url: 'https://via.placeholder.com/150', date: '2023-05-01' },
        ];
        setPhotos(mockPhotos);
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError('Failed to load photos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, [userId]);

  const renderPhoto = ({ item }: { item: ProgressPhoto }) => (
    <TouchableOpacity style={styles.photoContainer}>
      <Image 
        source={{ uri: item.url }}
        style={styles.photo}
        resizeMode="cover"
      />
      <Text style={styles.photoDate}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.colors.text.primary }]}>
          Progress Photos
        </Text>
        <TouchableOpacity style={styles.addButton}>
          <Camera size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : error ? (
        <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
      ) : photos.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
            No progress photos yet. Add your first one!
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
  error: {
    textAlign: 'center',
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 16,
  },
  photoContainer: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoDate: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: 4,
    fontSize: 12,
    textAlign: 'center',
  },
});