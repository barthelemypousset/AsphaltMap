import React from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ThemedView } from "./themed-view";
import { CircleX, MapPinPlus, Search } from "lucide-react-native";

interface SearchBarProps {
  startLocation: string;
  setStartLocation: (location: string) => void;
  endLocation: string;
  setEndLocation: (location: string) => void;
  isDestinationFocused: boolean;
  setIsDestinationFocused: (isFocused: boolean) => void;
  showStartInput: boolean;
  setShowStartInput: (show: boolean) => void;
  handleSearch: () => void; // Renamed from handleGetRoute for clarity in this component
  onBlur: () => void; // To dismiss keyboard and reset focus states when tapping outside
}

export function SearchBar({
  startLocation,
  setStartLocation,
  endLocation,
  setEndLocation,
  isDestinationFocused,
  setIsDestinationFocused,
  showStartInput,
  setShowStartInput,
  handleSearch,
  onBlur,
}: SearchBarProps) {
  const dismissKeyboardAndBlur = () => {
    Keyboard.dismiss();
    onBlur(); // Call the parent's blur handler
  };

  return (
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
            onSubmitEditing={handleSearch}
            returnKeyType={"search"}
            autoCapitalize={"none"}
            autoComplete="off"
            autoCorrect={false}
            inputMode="search"
            onBlur={dismissKeyboardAndBlur} // Ensure blur also calls parent handler
          />
          {/* Clear destination input button */}
          {isDestinationFocused && endLocation.length > 0 && (
            <Pressable
              onPress={() => setEndLocation("")}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
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
              handleSearch();
            } else {
              setShowStartInput(true);
            }
          }}
        >
          <Text style={styles.circleButtonText}>
            {showStartInput || (isDestinationFocused && endLocation.trim()) ? (
              <Search strokeWidth={1.2} />
            ) : (
              <MapPinPlus strokeWidth={1} />
            )}
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
            onBlur={dismissKeyboardAndBlur} // Ensure blur also calls parent handler
          />
          {/* Clear start input button - assuming it needs one too */}
          {startLocation.length > 0 && (
            <Pressable
              onPress={() => setStartLocation("")}
              style={styles.clearButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
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
  clearButton: {
    position: "absolute",
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 30,
  }
});
