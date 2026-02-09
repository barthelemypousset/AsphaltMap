export default ({ config }) => {
  return {
    ...config,
    name: "AsphaltMap",
    slug: "AsphaltMap",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "asphaltmap",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.stevegates.asphaltmap",
      ITSAppUsesNonExemptEncryption: false,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "@maplibre/maplibre-react-native",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: "531fa697-cf0e-49b1-810b-75ee84871f1f",
      },
      ...config.extra,
      MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
      BUNDLE_IDENTIFIER: process.env.BUNDLE_IDENTIFIER,
      PROJECT_ID: process.env.PROJECT_ID,
      BACKEND_IP_ADDRESS: process.env.BACKEND_IP_ADDRESS,
    },
  };
};
