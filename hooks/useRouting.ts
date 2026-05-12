import { useCallback } from "react";
import { Alert } from "react-native";
import Constants from "expo-constants";
import { GeoJSONPoint, GeoJSONLineString } from '@/types/geoJSON';

const BACKEND_IP_ADDRESS = Constants.expoConfig?.extra?.BACKEND_IP_ADDRESS;
const BACKEND_URL = `http://${BACKEND_IP_ADDRESS}:8000`;

export function useRouting() {
  const getRoute = useCallback(async (start: GeoJSONPoint, end: GeoJSONPoint): Promise<GeoJSONLineString | null> => {
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
  }, []);

  return { getRoute };
}
