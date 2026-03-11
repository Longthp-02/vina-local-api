import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { LanguageProvider, useLanguage } from "./i18n/LanguageProvider";
import { RootStackParamList } from "./navigation/types";
import { LanguageSelector } from "./components/LanguageSelector";
import { AddVendorScreen } from "./screens/AddVendorScreen";
import { CreateListScreen } from "./screens/CreateListScreen";
import { CreatorProfileScreen } from "./screens/CreatorProfileScreen";
import { EditListScreen } from "./screens/EditListScreen";
import { FollowingFeedScreen } from "./screens/FollowingFeedScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ListDetailScreen } from "./screens/ListDetailScreen";
import { MapScreen } from "./screens/MapScreen";
import { MyListsScreen } from "./screens/MyListsScreen";
import { NotificationsScreen } from "./screens/NotificationsScreen";
import { PhoneAuthScreen } from "./screens/PhoneAuthScreen";
import { PublicListsScreen } from "./screens/PublicListsScreen";
import { TopListsScreen } from "./screens/TopListsScreen";
import { VendorDetailScreen } from "./screens/VendorDetailScreen";
import { VendorsScreen } from "./screens/VendorsScreen";
import { VerifyCodeScreen } from "./screens/VerifyCodeScreen";
import { colors } from "./theme/colors";

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isLoading: isLanguageLoading, t } = useLanguage();

  if (isLoading || isLanguageLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: colors.primary,
          background: colors.secondary,
          card: colors.secondary,
          text: colors.text,
          border: colors.secondary,
          notification: colors.primary,
        },
        fonts: {
          regular: {
            fontFamily: "System",
            fontWeight: "400",
          },
          medium: {
            fontFamily: "System",
            fontWeight: "500",
          },
          bold: {
            fontFamily: "System",
            fontWeight: "700",
          },
          heavy: {
            fontFamily: "System",
            fontWeight: "800",
          },
        },
      }}
    >
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Home" : "PhoneAuth"}
        screenOptions={{
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
          headerStyle: styles.header,
          headerTintColor: colors.text,
          contentStyle: styles.screenContent,
          headerRight: () => <LanguageSelector />,
        }}
      >
        <Stack.Screen
          name="PhoneAuth"
          component={PhoneAuthScreen}
          options={{ title: t("signInTitle"), headerBackVisible: false }}
        />
        <Stack.Screen
          name="VerifyCode"
          component={VerifyCodeScreen}
          options={{ title: t("verifyCodeTitle") }}
        />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: t("homeTitle") }} />
        <Stack.Screen
          name="AddVendor"
          component={AddVendorScreen}
          options={{ title: t("addVendorTitle") }}
        />
        <Stack.Screen
          name="MyLists"
          component={MyListsScreen}
          options={{ title: t("myListsTitle") }}
        />
        <Stack.Screen
          name="PublicLists"
          component={PublicListsScreen}
          options={{ title: t("publicListsTitle") }}
        />
        <Stack.Screen
          name="FollowingFeed"
          component={FollowingFeedScreen}
          options={{ title: t("followingFeedTitle") }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ title: t("notificationsTitle") }}
        />
        <Stack.Screen
          name="TopLists"
          component={TopListsScreen}
          options={{ title: t("topListsTitle") }}
        />
        <Stack.Screen
          name="CreateList"
          component={CreateListScreen}
          options={{ title: t("createListTitle") }}
        />
        <Stack.Screen
          name="EditList"
          component={EditListScreen}
          options={{ title: t("editListTitle") }}
        />
        <Stack.Screen
          name="ListDetail"
          component={ListDetailScreen}
          options={{ title: t("listDetailTitle") }}
        />
        <Stack.Screen
          name="CreatorProfile"
          component={CreatorProfileScreen}
          options={{ title: t("creatorProfileTitle") }}
        />
        <Stack.Screen name="Map" component={MapScreen} options={{ title: t("mapTitle") }} />
        <Stack.Screen name="Vendors" component={VendorsScreen} options={{ title: t("vendorsTitle") }} />
        <Stack.Screen
          name="VendorDetail"
          component={VendorDetailScreen}
          options={{ title: t("vendorDetailTitle") }}
        />
      </Stack.Navigator>
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
  },
  header: {
    backgroundColor: colors.secondary,
  },
  headerTitle: {
    fontWeight: "700",
    color: colors.text,
  },
  screenContent: {
    backgroundColor: colors.secondary,
  },
});
