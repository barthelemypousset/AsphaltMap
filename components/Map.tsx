import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Camera,
  CameraRef,
  LineLayer,
  MapView,
  MarkerView,
  ShapeSource,
  UserLocation,
} from "@maplibre/maplibre-react-native";

// Types
import { Coords, GeoJSONPoint } from '@/types/geoJSON';

// Default region to center the map (e.g., Lille, France) - moved here for direct use
const DEFAULT_REGION = [3.057256, 50.62925];

interface MapProps {
  cameraRef: React.RefObject<CameraRef>;
  startCoords: GeoJSONPoint | null;
  endCoords: GeoJSONPoint | null;
  routeCoordinates: Coords[];
  onMapPress: (event: any) => void; // Added for map interaction
}

export function Map({ cameraRef, startCoords, endCoords, routeCoordinates, onMapPress }: MapProps) {
  return (
    <MapView
      style={styles.map}
      // Assuming mapStyle is a local asset or can be configured via props if dynamic
      mapStyle={require("../assets/mapStyles/asphalt.json")}
      onPress={onMapPress}
    >
      <Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate: DEFAULT_REGION,
          zoomLevel: 16,
          animationDuration: 0,
        }}
      />
      <UserLocation />

      {startCoords && (
        <MarkerView coordinate={startCoords.coordinates}>
          <Text style={styles.markerText}>Start</Text>
        </MarkerView>
      )}
      {endCoords && (
        <MarkerView coordinate={endCoords.coordinates}>
          <Text style={styles.markerText}>End</Text>
        </MarkerView>
      )}
      {routeCoordinates.length > 0 && (
        <ShapeSource id="routeSource" shape={{ type: "LineString", coordinates: routeCoordinates }}>
          <LineLayer
            id="routeLine"
            style={{
              lineColor: "#007AFF",
              lineWidth: 5,
            }}
          />
        </ShapeSource>
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  markerText: {
    backgroundColor: 'white',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    fontWeight: 'bold',
  }
});
