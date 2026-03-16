import * as FileSystem from "expo-file-system/legacy";
import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface DummyData {
  categories: { name: string; description: string }[];
  customizations: { name: string; price: number; type: string }[];
  menu: any[];
}

const data: DummyData = dummyData;

async function uploadImageToStorage(imageUrl: string) {
  try {
    const filename = imageUrl.split("/").pop() || `file-${Date.now()}.jpg`;

    const fileUri = (FileSystem as any).documentDirectory + filename;

    console.log("Downloading:", imageUrl);

    const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

    console.log("Uploading:", downloadResult.uri);

    const file = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      {
        name: filename,
        type: "image/jpeg",
        size: 0,
        uri: downloadResult.uri,
      },
    );

    return storage.getFileViewURL(appwriteConfig.bucketId, file.$id);
  } catch (error) {
    console.log("🚨 IMAGE FAILED:", imageUrl);
    throw error;
  }
}

async function seed(): Promise<void> {
  const categoryMap: Record<string, string> = {};
  const customizationMap: Record<string, string> = {};

  console.log("Seeding categories...");

  for (const cat of data.categories) {
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      ID.unique(),
      cat,
    );

    categoryMap[cat.name] = doc.$id;
  }

  console.log("✅ Categories done");

  console.log("Seeding customizations...");

  for (const cus of data.customizations) {
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.customizationsCollectionId,
      ID.unique(),
      cus,
    );

    customizationMap[cus.name] = doc.$id;
  }

  console.log("✅ Customizations done");

  console.log("Seeding menu...");

  for (const item of data.menu) {
    try {
      console.log("Item:", item.name);

      const uploadedImage = await uploadImageToStorage(item.image_url);

      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.menuCollectionId,
        ID.unique(),
        {
          name: item.name,
          description: item.description,
          image_url: uploadedImage,
          price: item.price,
          rating: item.rating,
          calories: item.calories,
          protein: item.protein,
          categories: categoryMap[item.category_name],
        },
      );

      for (const cusName of item.customizations) {
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.menuCustomizationsCollectionId,
          ID.unique(),
          {
            menu: doc.$id,
            customizations: customizationMap[cusName],
          },
        );
      }

      console.log("✅ Done:", item.name);
    } catch (error) {
      console.log("🚨 FAILED ITEM:", item.name);
      console.log(error);
    }
  }

  console.log("✅ SEED COMPLETE");
}

export default seed;
