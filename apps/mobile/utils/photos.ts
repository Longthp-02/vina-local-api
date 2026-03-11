import * as ImagePicker from "expo-image-picker";
import { PhotoUploadInput } from "../types/vendor";

export async function pickPhotoUploads(limit: number): Promise<PhotoUploadInput[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (permission.status !== "granted") {
    throw new Error("Photo library permission was not granted.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: false,
    allowsMultipleSelection: limit > 1,
    mediaTypes: ["images"],
    quality: 0.8,
    selectionLimit: limit,
  });

  if (result.canceled) {
    return [];
  }

  return result.assets.map((asset, index) => ({
    uri: asset.uri,
    name: asset.fileName ?? `photo-${index + 1}.jpg`,
    mimeType: asset.mimeType ?? "image/jpeg",
  }));
}
