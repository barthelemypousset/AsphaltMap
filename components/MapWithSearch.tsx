import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, Alert, Platform, Text } from 'react-native';
import MapView, { LatLng, Marker, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

const MAPBOX_ACCESS_TOKEN = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;

// Default region to center the map (e.g., Paris, France)
const DEFAULT_REGION = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

type Coords = { latitude: number; longitude: number };

export function MapWithSearch() {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startCoords, setStartCoords] = useState<Coords | null>(null);
  const [endCoords, setEndCoords] = useState<Coords | null>(null);
  
  const mapRef = useRef<MapView>(null);
  const userLocation = useRef<Coords | null>(null);

  useEffect(() => {
    const requestLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access location was denied.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      userLocation.current = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      mapRef.current?.animateToRegion({
        ...userLocation.current,
        latitudeDelta: 0.05,
        longitudeDelta: 0.02,
      }, 1000);

      setStartLocation('My Location');
    };

    requestLocation();
  }, []);

  const geocode = async (address: string): Promise<Coords | null> => {
    if (address.toLowerCase() === 'my location' && userLocation.current) {
      return userLocation.current;
    }

    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address
    )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;
    
    try {
      const response = await fetch(geocodingUrl);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        return { latitude, longitude };
      }
    } catch (error) {
      console.error('Geocoding API error:', error);
    }
    return null;
  };

  const handleGetRoute = async () => {
    if (!startLocation.trim() || !endLocation.trim()) {
      Alert.alert('Missing information', 'Please fill in both start and end locations.');
      return;
    }

    const [start, end] = await Promise.all([
      geocode(startLocation),
      geocode(endLocation)
    ]);
    
    if (start) setStartCoords(start);
    if (end) setEndCoords(end);

    if (start && end) {
      // TODO: Call the actual routing engine with start and end coordinates
      console.log('Start Coords:', start);
      console.log('End Coords:', end);
      Alert.alert('Route Ready', 'Coordinates found. Ready to calculate route.');
      // Example of fitting map to both markers
      mapRef.current?.fitToCoordinates([start, end], {
        edgePadding: { top: 150, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    } else {
      Alert.alert('Geocoding failed', 'Could not determine coordinates for one or both locations.');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={true}
        onPress={(event) => {
          console.log('Map tapped at:', event.nativeEvent.coordinate);
        }}
      >
        {MAPBOX_ACCESS_TOKEN && (
          <UrlTile
            urlTemplate={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`}
            maximumZ={20}
            flipY={false}
          />
        )}
        {startCoords && <Marker coordinate={startCoords} title="Start" pinColor="green" />}
        {endCoords && <Marker coordinate={endCoords} title="End" pinColor="red" />}
      </MapView>

      <ThemedView style={styles.itineraryContainer}>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>From:</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Start location"
            placeholderTextColor="#888"
            value={startLocation}
            onChangeText={setStartLocation}
          />
        </View>
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>To:</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="End location"
            placeholderTextColor="#888"
            value={endLocation}
            onChangeText={setEndLocation}
          />
        </View>
        <ThemedText style={styles.routeButton} onPress={handleGetRoute}>
          Get Route
        </ThemedText>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  itineraryContainer: {
    position: 'absolute',
    top: 50, // Adjust as needed for status bar
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 8,
    padding: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontWeight: 'bold',
    marginRight: 8,
    width: 40,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#333',
  },
  routeButton: {
    marginTop: 8,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    color: '#fff',
    borderRadius: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
