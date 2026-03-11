import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getNotifications, getSuggestedCreators } from "../api";
import { useAuth } from "../auth/AuthProvider";
import { useLanguage } from "../i18n/LanguageProvider";
import { translations } from "../i18n/translations";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;
type TranslationKey = keyof typeof translations.vi;
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const primaryActions = [
  {
    key: "vendors",
    labelKey: "viewVendors",
    route: "Vendors" as const,
    icon: "silverware-fork-knife",
  },
  {
    key: "addVendor",
    labelKey: "addVendor",
    route: "AddVendor" as const,
    icon: "storefront-plus",
  },
  {
    key: "map",
    labelKey: "exploreMap",
    route: "Map" as const,
    icon: "map-marker-radius",
  },
] satisfies Array<{
  key: string;
  labelKey: TranslationKey;
  route: keyof RootStackParamList;
  icon: IconName;
}>;

const discoveryActions = [
  {
    key: "myLists",
    labelKey: "myLists",
    route: "MyLists" as const,
    icon: "bookmark-multiple",
  },
  {
    key: "publicLists",
    labelKey: "publicLists",
    route: "PublicLists" as const,
    icon: "compass-rose",
  },
  {
    key: "topLists",
    labelKey: "topLists",
    route: "TopLists" as const,
    icon: "trophy-outline",
  },
  {
    key: "followingFeed",
    labelKey: "followingFeed",
    route: "FollowingFeed" as const,
    icon: "crown-outline",
  },
] satisfies Array<{
  key: string;
  labelKey: TranslationKey;
  route: keyof RootStackParamList;
  icon: IconName;
}>;

export function HomeScreen({ navigation }: Props) {
  const { isAuthenticated, isLoading, signOut, user } = useAuth();
  const { t } = useLanguage();
  const { data: suggestedCreators } = useQuery({
    queryKey: ["suggestedCreators"],
    queryFn: () => getSuggestedCreators(),
  });
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    enabled: isAuthenticated,
  });

  const unreadNotificationCount =
    notifications?.filter((notification) => !notification.readAt).length ?? 0;

  async function handleAuthAction() {
    if (isAuthenticated) {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: "PhoneAuth" }],
      });
      return;
    }

    navigation.navigate("PhoneAuth");
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <MaterialCommunityIcons
            name="star-four-points-outline"
            size={16}
            color={colors.goldSoft}
          />
          <Text style={styles.heroBadgeText}>Vinal Local</Text>
        </View>
        <Text style={styles.title}>{t("appTitle")}</Text>
        <Text style={styles.subtitle}>{t("homeSubtitle")}</Text>
        <Text style={styles.authText}>
          {isLoading
            ? t("checkingSession")
            : isAuthenticated
              ? t("signedInAs", { value: user?.phoneNumber ?? user?.displayName ?? "" })
              : t("signInPrompt")}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => void handleAuthAction()}
          style={styles.authButton}
        >
          <Text style={styles.authButtonText}>
            {isAuthenticated ? t("signOut") : t("signIn")}
          </Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Go now</Text>
        <View style={styles.primaryGrid}>
          {primaryActions.map((action) => (
            <Pressable
              key={action.key}
              accessibilityRole="button"
              onPress={() => navigation.navigate(action.route)}
              style={styles.primaryCard}
            >
              <View style={styles.primaryIconWrap}>
                <MaterialCommunityIcons name={action.icon} size={22} color={colors.gold} />
              </View>
              <Text style={styles.primaryCardTitle}>{t(action.labelKey)}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("Notifications")}
            style={styles.notificationPill}
          >
            <Text style={styles.notificationPillText}>{t("notifications")}</Text>
            {unreadNotificationCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadNotificationCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
        <View style={styles.secondaryList}>
          {discoveryActions.map((action) => (
            <Pressable
              key={action.key}
              accessibilityRole="button"
              onPress={() => navigation.navigate(action.route)}
              style={styles.secondaryCard}
            >
              <View style={styles.secondaryCardRow}>
                <MaterialCommunityIcons name={action.icon} size={18} color={colors.primary} />
                <Text style={styles.secondaryCardTitle}>{t(action.labelKey)}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {suggestedCreators && suggestedCreators.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("suggestedCreators")}</Text>
          <View style={styles.creatorList}>
            {suggestedCreators.slice(0, 3).map((creator) => (
              <Pressable
                key={creator.id}
                accessibilityRole="button"
                onPress={() => navigation.navigate("CreatorProfile", { userId: creator.id })}
                style={styles.creatorCard}
              >
                <View style={styles.creatorAvatar}>
                  <Text style={styles.creatorAvatarText}>
                    {creator.displayName.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.creatorContent}>
                  <Text style={styles.creatorName}>{creator.displayName}</Text>
                  <Text style={styles.creatorMeta}>
                    {creator.followerCount} followers · {creator.publicListCount} public lists
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    paddingBottom: 36,
    backgroundColor: colors.secondary,
    gap: 20,
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    padding: 20,
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 247, 242, 0.18)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 14,
  },
  heroBadgeText: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    color: colors.secondary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
    color: "#FFE8DC",
  },
  authText: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    color: "#FFE8DC",
  },
  authButton: {
    alignSelf: "flex-start",
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  authButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  primaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  primaryCard: {
    width: "48%",
    minHeight: 112,
    borderRadius: 24,
    padding: 16,
    justifyContent: "flex-end",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  primaryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    backgroundColor: colors.secondaryStrong,
  },
  primaryCardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  secondaryList: {
    gap: 10,
  },
  secondaryCard: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  secondaryCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  notificationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notificationPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  badge: {
    minWidth: 22,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  badgeText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: "800",
  },
  creatorList: {
    gap: 12,
  },
  creatorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 22,
    padding: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  creatorAvatarText: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: "800",
  },
  creatorContent: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  creatorMeta: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
});
