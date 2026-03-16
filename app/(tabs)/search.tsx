import CartButton from "@/components/CartButton";
import Filter from "@/components/Filter";
import MenuCard from "@/components/menuCard";
import SearchBar from "@/components/SearchBar";

import { getCategories, getMenu } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import cn from "clsx";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Search = () => {
  const { query, category } = useLocalSearchParams<{
    query?: string;
    category?: string;
  }>();

  const { data, loading } = useAppwrite({
    fn: getMenu,
    params: { category: category ?? "", query: query ?? "", limit: 6 },
  });

  // console.log("category param:", category);
  // console.log("data:", data);
  const { data: categories } = useAppwrite({ fn: getCategories });

  return (
    <SafeAreaView className="flex-1 bg-white h-full">
      <FlatList
        data={data}
        renderItem={({ item, index }) => {
          const isFirstColItem = index % 2 === 0;
          return (
            <View
              className={cn(
                "flex-1 w-[48%]",
                !isFirstColItem ? "mt-10" : "mt-0",
              )}
            >
              <MenuCard item={item} />
            </View>
          );
        }}
        keyExtractor={(item, index) => item?.$id ?? index.toString()}
        numColumns={2}
        columnWrapperClassName="gap-7"
        contentContainerClassName="gap-7 px-5 pb-32"
        ListHeaderComponent={() => (
          <View className="my-5 gap-5">
            <View className="flex-between flex-row w-full">
              <View className="flex-start">
                <Text className="small-bold uppercase text-primary">
                  Search
                </Text>
                <View className="small-bold flex-row gap-x-1 mt-0.5">
                  <Text className="paragraph-semibold text-dark-100">
                    Find your fovorites food
                  </Text>
                </View>
              </View>
              <CartButton />
            </View>
            <SearchBar />
            <Filter categories={categories ?? []} />
          </View>
        )}
        ListEmptyComponent={() =>
          loading ? <Text>Loading menu...</Text> : <Text>No Result Found</Text>
        }
      />
    </SafeAreaView>
  );
};

export default Search;
