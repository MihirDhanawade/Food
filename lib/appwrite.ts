import { CreateUserParams, SignInParams } from "@/type";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  projectName: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_NAME,
  databaseID: "699b15b9001479cedefe",
  userCollectionId: "699b16130030777b0193",
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint!)
  .setProject(appwriteConfig.projectId!)
  .setPlatform("com.md.food-order");

export const account = new Account(client);
export const databases = new Databases(client);
export const avatars = new Avatars(client);

export const createUser = async ({
  email,
  password,
  name,
}: CreateUserParams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw Error;
    await signIn({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);

    return await databases.createDocument(
      appwriteConfig.databaseID,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        email,
        name,
        accountId: newAccount.$id,
        avatar: avatarUrl,
      },
    );
  } catch (e) {
    throw new Error(e as string);
  }
};
export const signIn = async ({ email, password }: SignInParams) => {
  try {
    await account.createEmailPasswordSession(email, password);
  } catch (e) {
    throw new Error(e as string);
  }
};
export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseID,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)],
    );

    return currentUser.documents[0];
  } catch (e) {
    return null;
  }
};
