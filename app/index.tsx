import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { CameraRef } from "@maplibre/maplibre-react-native";

import { Map } from "@/components/Map";
import { SearchBar } from "@/components/SearchBar";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useGeocoding } from "@/hooks/useGeocoding";
import { useRouting } from "@/hooks/useRouting";
import {Coords, GeoJSONPoint} from "@/types/geoJSON"

export default function MapScreen() {
  // --- STATE ---
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [startCoords, setStartCoords] = useState<GeoJSONPoint | null>(null);
  const [endCoords, setEndCoords] = useState<GeoJSONPoint | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coords[]>([]);
  const [isDestinationFocused, setIsDestinationFocused] = useState(false);
  const [showStartInput, setShowStartInput] = useState(false);

  // --- REFS ---
  const cameraRef = useRef<CameraRef>(null);

  // --- HOOKS ---
  const { userLocation } = useGeolocation();
  const { geocodeAddress } = useGeocoding();
  const { getRoute } = useRouting();

  // --- EFFECTS ---
  // Set user's location as the default start location once it's available
  useEffect(() => {
    if (userLocation) {
      setStartLocation("My Location");
      cameraRef.current?.flyTo(userLocation.coordinates, 1000);
    }
  }, [userLocation]);

  // --- HANDLERS ---
  const handleSearch = async () => {
    if (!startLocation.trim() || !endLocation.trim()) {
      Alert.alert("Missing information", "Please fill in both start and end locations.");
      return;
    }

    Keyboard.dismiss();
    setRouteCoordinates([]); // Clear previous route

    // Geocode start and end locations
    const [start, end] = await Promise.all([
      geocodeAddress(startLocation, userLocation),
      geocodeAddress(endLocation, userLocation),
    ]);

    setStartCoords(start);
    setEndCoords(end);

    if (start && end) {
      // Fit map to bounds
      cameraRef.current?.fitBounds(start.coordinates, end.coordinates, 40, 1000);

      // Get and set the new route
      const route = await getRoute(start, end);
      if (route) {
        setRouteCoordinates(route.coordinates);
      }
    } else {
      Alert.alert("Geocoding failed", "Could not determine coordinates for one or both locations.");
    }
  };

  const handleMapPress = () => {
    Keyboard.dismiss();
    setIsDestinationFocused(false);
    setShowStartInput(false);
  };

  const handleBlur = () => {
    setIsDestinationFocused(false);
    // We might not need to hide the start input on every blur,
    // but this preserves the old behavior.
    setShowStartInput(false);
  };

  // --- RENDER ---
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={handleMapPress}>
        <View style={styles.container}>
          <Map
            cameraRef={cameraRef}
            startCoords={startCoords}
            endCoords={endCoords}
            routeCoordinates={routeCoordinates}
            onMapPress={handleMapPress}
          />
          <SearchBar
            startLocation={startLocation}
            setStartLocation={setStartLocation}
            endLocation={endLocation}
            setEndLocation={setEndLocation}
            isDestinationFocused={isDestinationFocused}
            setIsDestinationFocused={setIsDestinationFocused}
            showStartInput={showStartInput}
            setShowStartInput={setShowStartInput}
            handleSearch={handleSearch}
            onBlur={handleBlur}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
