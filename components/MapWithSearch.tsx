import Constants from "expo-constants";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, UrlTile } from "react-native-maps";
import { ThemedView } from "./themed-view";
import { CircleX, MapPinPlus, MapPlus, Search, Send } from "lucide-react-native";

const MAPBOX_ACCESS_TOKEN = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;

const BACKEND_IP_ADDRESS = Constants.expoConfig?.extra?.BACKEND_IP_ADDRESS;
const BACKEND_URL = `http://${BACKEND_IP_ADDRESS}:8000`;

// Default region to center the map (e.g., Paris, France)
const DEFAULT_REGION = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

type Coords = { latitude: number; longitude: number };

export function MapWithSearch() {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [startCoords, setStartCoords] = useState<Coords | null>(null);
  const [endCoords, setEndCoords] = useState<Coords | null>(null);
  const [isDestinationFocused, setIsDestinationFocused] = useState(false);
  const [showStartInput, setShowStartInput] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<Coords[]>([]);

  const mapRef = useRef<MapView>(null);
  const userLocation = useRef<Coords | null>(null);

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
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      mapRef.current?.animateToRegion(
        {
          ...userLocation.current,
          latitudeDelta: 0.05,
          longitudeDelta: 0.02,
        },
        1000,
      );

      setStartLocation("My Location");
    };

    requestLocation();
  }, []);

  // Get coordinates of searched location
  const geocode = async (address: string): Promise<Coords | null> => {
    if (address.toLowerCase() === "my location" && userLocation.current) {
      return userLocation.current;
    }

    const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      address,
    )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;

    try {
      const response = await fetch(geocodingUrl);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        return { latitude, longitude };
      }
    } catch (error) {
      console.error("Geocoding API error:", error);
    }
    return null;
  };

  // Launch the search
  const handleGetRoute = async () => {
    if (!startLocation.trim() || !endLocation.trim()) {
      Alert.alert("Missing information", "Please fill in both start and end locations.");
      return;
    }

    // Clear previous route
    setRouteCoordinates([]);

    const [start, end] = await Promise.all([geocode(startLocation), geocode(endLocation)]);

    if (start) setStartCoords(start);
    if (end) setEndCoords(end);

    // Set position of the map on screen
    if (start && end) {
      mapRef.current?.fitToCoordinates([start, end], {
        edgePadding: { top: 50, right: 50, bottom: 150, left: 50 },
        animated: true,
      });

      // Try to get the route via our routing engine backend
      try {
        const response = await fetch(`${BACKEND_URL}/route`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            start_lat: start.latitude,
            start_lon: start.longitude,
            end_lat: end.latitude,
            end_lon: end.longitude,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setRouteCoordinates(data.route);
        } else {
          Alert.alert("Failed to get route", data.detail || "An unknown error occurred.");
        }
      } catch (error) {
        console.error("Route fetch error:", error);
        Alert.alert("Connection Error", "Could not connect to the backend. Is it running? Is the IP address correct?");
      }
    } else {
      Alert.alert("Geocoding failed", "Could not determine coordinates for one or both locations.");
    }
  };

  const touchOutsideInputField = () => {
    Keyboard.dismiss();
    setIsDestinationFocused(false);
    setShowStartInput(false);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={() => touchOutsideInputField()}>
        <View style={styles.container}>
          <MapView
            ref={mapRef}
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            initialRegion={DEFAULT_REGION}
            showsUserLocation={true}
            onPress={(event) => {
              console.log("Map tapped at:", event.nativeEvent.coordinate);
            }}>
            {MAPBOX_ACCESS_TOKEN && (
              <UrlTile
                urlTemplate={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`}
                maximumZ={20}
                flipY={false}
              />
            )}
            {startCoords && <Marker coordinate={startCoords} title="Start" pinColor="green" />}
            {endCoords && <Marker coordinate={endCoords} title="End" pinColor="red" />}
            {routeCoordinates.length > 0 && (
              <Polyline coordinates={routeCoordinates} strokeColor="#007AFF" strokeWidth={5} />
            )}
          </MapView>

          <ThemedView style={styles.itineraryContainer}>
            <View style={styles.inputRow}>
              <View style={{ flex: 1, position: "relative" }}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Enter destination"
                  placeholderTextColor="#888"
                  value={endLocation}
                  onChangeText={setEndLocation}
                  onFocus={() => setIsDestinationFocused(true)}
                  onSubmitEditing={() => handleGetRoute()}
                  returnKeyType={"search"}
                  autoCapitalize={"none"}
                  autoComplete="off"
                  autoCorrect={false}
                  inputMode="search"
                />
                {/* if destination field focused + text in it */}
                {isDestinationFocused && endLocation.length > 0 && (
                  <Pressable
                    onPress={() => setEndLocation("")}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: 0,
                      bottom: 0,
                      justifyContent: "center",
                      alignItems: "center",
                      width: 30,
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <CircleX size={32} strokeWidth={1.2} />
                  </Pressable>
                )}
              </View>
              <Pressable
                style={styles.circleButton}
                onPress={() => {
                  if (showStartInput) {
                    setShowStartInput(false);
                  } else if (isDestinationFocused && endLocation.trim()) {
                    handleGetRoute();
                  } else {
                    setShowStartInput(true);
                  }
                }}>
                <Text style={styles.circleButtonText}>
                  {showStartInput || (isDestinationFocused && endLocation.trim()) ?
                    <Search strokeWidth={1.2} />
                  : <MapPinPlus strokeWidth={1} />}
                </Text>
              </Pressable>
            </View>

            {showStartInput && (
              <View style={styles.startInputContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Enter start location"
                  placeholderTextColor="#888"
                  value={startLocation === "My Location" ? "" : startLocation}
                  onChangeText={setStartLocation}
                  onSubmitEditing={() => setShowStartInput(false)}
                />
              </View>
            )}
          </ThemedView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 40,
    padding: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
    flexDirection: "row",
    alignItems: "center",
  },
  startInputContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 70, // 10 (padding) + 50 (button) + 10 (margin)
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 20,
    color: "#333",
  },
  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  circleButtonText: {
    fontSize: 24,
    color: "#333",
  },
});
