import React from "react";
import { StyleSheet, Text } from "react-native";
import {
  Camera,
  CameraRef,
  LineLayer,
  MapView,
  MarkerView,
  ShapeSource,
  UserLocation,
} from "@maplibre/maplibre-react-native";

// Types from the original file
type Coords = [number, number];
type GeoJSONPoint = {
  type: "Point";
  coordinates: [number, number];
};

// Default region to center the map (e.g., Lille, France)
const DEFAULT_REGION = [3.057256, 50.62925];

interface MapViewComponentProps {
  cameraRef: React.RefObject<CameraRef>;
  startCoords: GeoJSONPoint | null;
  endCoords: GeoJSONPoint | null;
  routeCoordinates: Coords[];
}

export function MapViewComponent({
  cameraRef,
  startCoords,
  endCoords,
  routeCoordinates,
}: MapViewComponentProps) {
  return (
    <MapView
      style={styles.map}
      mapStyle={require("../assets/mapStyles/asphalt.json")}
      onPress={(event) => {
        console.log("Map tapped at:", event.geometry);
      }}>
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
          <Text>Start</Text>
        </MarkerView>
      )}
      {endCoords && (
        <MarkerView coordinate={endCoords.coordinates}>
          <Text>End</Text>
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
});
