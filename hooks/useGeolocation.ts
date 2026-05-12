import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { GeoJSONPoint } from '@/types/geoJSON';

export function useGeolocation() {
  const [userLocation, setUserLocation] = useState<GeoJSONPoint | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const requestLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        const message = "Permission to access location was denied.";
        setErrorMsg(message);
        Alert.alert("Permission denied", message);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        type: "Point",
        coordinates: [location.coords.longitude, location.coords.latitude],
      });
    };

    requestLocation();
  }, []);

  return { userLocation, errorMsg };
}
