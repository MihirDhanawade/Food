import {
  Category,
  CreateUserParams,
  GetMenuParams,
  MenuItem,
  SignInParams,
} from "@/type";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  projectName: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_NAME,
  databaseId: "699b15b9001479cedefe",
  bucketId: "699c7c5a0039f20e5757",
  userCollectionId: "699b16130030777b0193",
  categoriesCollectionId: "699c7645000e1027e997",
  menuCollectionId: "699c774a00079d98095b",
  customizationsCollectionId: "699c79dd0011296bf771",
  menuCustomizationsCollectionId: "699c7b10001d30ff13a5",
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint!)
  .setProject(appwriteConfig.projectId!)
  .setPlatform("com.md.food-order");

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
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
      appwriteConfig.databaseId,
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
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)],
    );

    if (currentUser.documents.length === 0) {
      const avatarUrl = avatars.getInitialsURL(currentAccount.name);
      const newDoc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        ID.unique(),
        {
          email: currentAccount.email,
          name: currentAccount.name,
          accountId: currentAccount.$id,
          avatar: avatarUrl,
        },
      );
      return newDoc;
    }

    return currentUser.documents[0];
  } catch (e) {
    return null;
  }
};

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries: string[] = [];

    if (category && category !== "all") {
      queries.push(Query.equal("categories", category));
    }
    if (query) queries.push(Query.search("name", query));

    const menus = await databases.listDocuments<MenuItem>(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      queries,
    );
    return menus.documents;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const getCategories = async () => {
  try {
    // Step 1: Fetch all menu items to find which category IDs are actually in use
    const allMenuItems = await databases.listDocuments<MenuItem>(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      [Query.limit(100)],
    );

    // Step 2: Collect unique category IDs from real menu items
    const uniqueCategoryIds = [
      ...new Set(
        allMenuItems.documents
          .map((item) => item.categories)
          .filter(Boolean)
          .map((cat) => (typeof cat === "string" ? cat : (cat as any).$id)),
      ),
    ];

    if (uniqueCategoryIds.length === 0) return [];

    // Step 3: Fetch those specific category documents by their IDs
    const categoryDocs = await databases.listDocuments<Category>(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      [Query.equal("$id", uniqueCategoryIds), Query.limit(50)],
    );

    // Step 4: Deduplicate by name (handles multiple seed runs gracefully)
    const seen = new Set<string>();
    const unique = categoryDocs.documents.filter((cat) => {
      if (seen.has(cat.name)) return false;
      seen.add(cat.name);
      return true;
    });

    return unique;
  } catch (error) {
    console.log("getCategories ERROR:", error);
    throw new Error(error as string);
  }
};
