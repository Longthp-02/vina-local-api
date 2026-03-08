import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vinal Local</Text>
      <Text style={styles.subtitle}>Bản đồ cho người sành ăn</Text>

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate("Vendors")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>View Vendors</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate("AddVendor")}
        style={[styles.button, styles.secondaryButton]}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Add Vendor</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate("Map")}
        style={[styles.button, styles.secondaryButton]}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Explore Map</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#4b5563",
  },
  button: {
    marginTop: 24,
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#111827",
  },
  secondaryButtonText: {
    color: "#111827",
  },
});
