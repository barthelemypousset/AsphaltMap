import { useCallback } from "react";
import Constants from "expo-constants";
import { GeoJSONPoint } from '@/types/geoJSON';

const MAPBOX_ACCESS_TOKEN = Constants.expoConfig?.extra?.MAPBOX_ACCESS_TOKEN;

export function useGeocoding() {
  const geocodeAddress = useCallback(
    async (address: string, userLocation: GeoJSONPoint | null): Promise<GeoJSONPoint | null> => {
      if (address.toLowerCase() === "my location" && userLocation) {
        return userLocation;
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
    },
    [],
  );

  return { geocodeAddress };
}
