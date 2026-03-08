import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet } from "react-native";
import { RootStackParamList } from "./navigation/types";
import { AddVendorScreen } from "./screens/AddVendorScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { MapScreen } from "./screens/MapScreen";
import { VendorDetailScreen } from "./screens/VendorDetailScreen";
import { VendorsScreen } from "./screens/VendorsScreen";

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerTitleStyle: styles.headerTitle,
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Vinal Local" }} />
          <Stack.Screen
            name="AddVendor"
            component={AddVendorScreen}
            options={{ title: "Add Vendor" }}
          />
          <Stack.Screen name="Map" component={MapScreen} options={{ title: "Map" }} />
          <Stack.Screen name="Vendors" component={VendorsScreen} options={{ title: "Vendors" }} />
          <Stack.Screen
            name="VendorDetail"
            component={VendorDetailScreen}
            options={{ title: "Vendor Detail" }}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontWeight: "700",
  },
});
