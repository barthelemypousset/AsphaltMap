import Constants from "expo-constants";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { CameraRef } from "@maplibre/maplibre-react-native";
import { MapViewComponent } from "../components/MapViewComponent";
import { SearchComponent } from "../components/SearchComponent";

const MAPBOX_ACCESS_TOKEN = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;
const BACKEND_IP_ADDRESS = Constants.expoConfig?.extra?.BACKEND_IP_ADDRESS;
const BACKEND_URL = `http://${BACKEND_IP_ADDRESS}:8000`;

// Type definitions
type Coords = [number, number];

type GeoJSONPoint = {
  type: "Point";
  coordinates: [number, number];
};

type GeoJSONLineString = {
  type: "LineString";
  coordinates: [[number, number], [number, number], ...[number, number][]];
};

export default function MapWithSearch() {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [startCoords, setStartCoords] = useState<GeoJSONPoint | null>(null);
  const [endCoords, setEndCoords] = useState<GeoJSONPoint | null>(null);
  const [isDestinationinputFocused, setIsDestinationInputFocused] = useState(false);
  const [isStartInputFocused, setIsStartInputFocused] = useState(false);
  const [showStartInput, setShowStartInput] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Coords[]>([]);

  const cameraRef = useRef<CameraRef>(null);
  const userLocation = useRef<GeoJSONPoint | null>(null);

  // Get user geolocation
  useEffect(() => {
    const requestLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Permission to access location was denied.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      userLocation.current = {
        type: "Point",
        coordinates: [location.coords.longitude, location.coords.latitude],
      };

      cameraRef.current?.flyTo(userLocation.current.coordinates, 1000);

      setStartLocation("My Location");
    };

    requestLocation();
  }, []);

  // Get coordinates of searched location
  const geocodeAddress = async (address: string): Promise<GeoJSONPoint | null> => {
    if (address.toLowerCase() === "my location" && userLocation.current) {
      return { type: "Point", coordinates: userLocation.current.coordinates };
    }

    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address,
    )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;

    try {
      const response = await fetch(geocodingUrl);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        return { type: "Point", coordinates: [longitude, latitude] };
      }
    } catch (error) {
      console.error("Geocoding API error:", error);
    }
    return null;
  };

  // Get the route via the routing engine (backend)
  const routePoints = async (start: GeoJSONPoint, end: GeoJSONPoint): Promise<GeoJSONLineString | null> => {
    try {
      const response = await fetch(`${BACKEND_URL}/route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_lat: start.coordinates[1],
          start_lon: start.coordinates[0],
          end_lat: end.coordinates[1],
          end_lon: end.coordinates[0],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const route = data.route.map((point: { latitude: number; longitude: number }) => [
          point.longitude,
          point.latitude,
        ]);
        return {
          type: "LineString",
          coordinates: route,
        };
      } else {
        Alert.alert("Failed to get route", data.detail || "An unknown error occurred.");
        return null;
      }
    } catch (error) {
      console.error("Route fetch error:", error);
      Alert.alert("Connection Error", "Could not connect to the backend. Is it running? Is the IP address correct?");
      return null;
    }
  };

  // Launch the search
  const handleGetRoute = async () => {
    if (!startLocation.trim() || !endLocation.trim()) {
      Alert.alert("Missing information", "Please fill in both start and end locations.");
      return;
    }

    // Clear previous route
    setRouteCoordinates([]);

    const [start, end] = await Promise.all([geocodeAddress(startLocation), geocodeAddress(endLocation)]);

    if (start) setStartCoords(start);
    if (end) setEndCoords(end);

    // Set position of the map on screen
    if (start && end) {
      cameraRef.current?.fitBounds(start.coordinates, end.coordinates, 40, 1000);
      // Get routing between the start and end
      const route = await routePoints(start, end);
      if (route) {
        setRouteCoordinates(route.coordinates);
      }
    } else {
      Alert.alert("Geocoding failed", "Could not determine coordinates for one or both locations.");
    }
  };

  const touchOutsideInputField = () => {
    Keyboard.dismiss();
    setIsDestinationInputFocused(false);
    setIsStartInputFocused(false);
    setShowStartInput(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={() => touchOutsideInputField()}>
        <View style={styles.container}>
          <MapViewComponent
            cameraRef={cameraRef}
            startCoords={startCoords}
            endCoords={endCoords}
            routeCoordinates={routeCoordinates}
          />
          <SearchComponent
            startLocation={startLocation}
            setStartLocation={setStartLocation}
            endLocation={endLocation}
            setEndLocation={setEndLocation}
            isDestinationinputFocused={isDestinationinputFocused}
            setIsDestinationInputFocused={setIsDestinationInputFocused}
            isStartInputFocused={isStartInputFocused}
            setIsStartInputFocused={setIsStartInputFocused}
            showStartInput={showStartInput}
            setShowStartInput={setShowStartInput}
            handleGetRoute={handleGetRoute}
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
