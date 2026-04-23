import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ThemedView } from "./themed-view";
import { CircleX, Menu, Search } from "lucide-react-native";

interface SearchComponentProps {
  startLocation: string;
  setStartLocation: (location: string) => void;
  endLocation: string;
  setEndLocation: (location: string) => void;
  isDestinationinputFocused: boolean;
  setIsDestinationInputFocused: (isFocused: boolean) => void;
  isStartInputFocused: boolean;
  setIsStartInputFocused: (isFocused: boolean) => void;
  showStartInput: boolean;
  setShowStartInput: (show: boolean) => void;
  handleGetRoute: () => void;
}

export function SearchComponent({
  startLocation,
  setStartLocation,
  endLocation,
  setEndLocation,
  isDestinationinputFocused,
  setIsDestinationInputFocused,
  isStartInputFocused,
  setIsStartInputFocused,
  showStartInput,
  setShowStartInput,
  handleGetRoute,
}: SearchComponentProps) {
  return (
    <ThemedView style={styles.itineraryContainer}>
      <View style={styles.inputRow}>
        <View style={{ flex: 1, position: "relative" }}>
          {/* Destination input */}
          <TextInput
            style={styles.searchInput}
            placeholder="Enter destination"
            placeholderTextColor="#888"
            value={endLocation}
            onChangeText={setEndLocation}
            onFocus={() => setIsDestinationInputFocused(true)}
            onSubmitEditing={() => handleGetRoute()}
            returnKeyType={"search"}
            autoCapitalize={"none"}
            autoComplete="off"
            autoCorrect={false}
            inputMode="search"
          />
          {/* if destination field focused + text in it */}
          {isDestinationinputFocused && endLocation.length > 0 && (
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
            } else if (isDestinationinputFocused && endLocation.trim()) {
              handleGetRoute();
            } else {
              setShowStartInput(true);
            }
          }}>
          <Text style={styles.circleButtonText}>
            {showStartInput || (isDestinationinputFocused && endLocation.trim()) ?
              <Search strokeWidth={1.2} />
            : <Menu strokeWidth={1} />}
          </Text>
        </Pressable>
      </View>

      {showStartInput && !isDestinationinputFocused && (
        <View style={styles.startInputContainer}>
          {/* Start input */}
          <TextInput
            style={styles.searchInput}
            placeholder="Enter start location"
            placeholderTextColor="#888"
            value={startLocation === "My Location" ? "" : startLocation}
            onChangeText={setStartLocation}
            onFocus={() => setIsStartInputFocused(true)}
            onSubmitEditing={() => setShowStartInput(false)}
          />
          {/* if destination field focused + text in it */}
          {isStartInputFocused && startLocation.length > 0 && (
            <Pressable
              onPress={() => setStartLocation("")}
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
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  itineraryContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 40,
    padding: 10,
  },
  startInputContainer: {
    position: "absolute",
    bottom: 80,
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
