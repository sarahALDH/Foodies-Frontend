import RecipeType from "@/types/RecipeType";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const Recipe = ({ recipe }: { recipe: RecipeType }) => {
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "green",
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          backgroundColor: "lightblue",
          padding: 20,
          width: "100%",
          borderRadius: 15,
          minHeight: 180,
          elevation: 5,
          shadowColor: "black",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 8,
          }}
        >
          {recipe.title}
        </Text>
        <Text
          style={{
            color: "white",
            fontSize: 16,
            fontWeight: "600",
            opacity: 0.8,
          }}
        >
          Created By: {recipe.user.userName}
        </Text>

        {/* Recipe Info Row */}
        <View
          style={{
            flexDirection: "row",
            gap: 15,
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <View
            style={{
              backgroundColor: "lightgreen",
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontSize: 12 }}>
              ⏱️ {recipe.cookTime} min
            </Text>
          </View>
          <View
            style={{
              backgroundColor: "lightgreen",
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontSize: 12 }}>
              🍽️ {recipe.servings} servings
            </Text>
          </View>
        </View>

        {/* Categories/Cuisine Tags */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          {recipe.category?.map(
            (
              category: { _id: string; categoryName: string },
              index: number
            ) => (
              <View
                style={{
                  backgroundColor: "lightgreen",
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 5,
                }}
                key={index}
              >
                <Text style={{ color: "white" }}>{category.categoryName}</Text>
              </View>
            )
          )}
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: "lightgreen",
            padding: 12,
            borderRadius: 10,
            width: "100%",
            alignItems: "center",
            marginBottom: 5,
          }}
          onPress={() => router.push(`/recipe/${recipe.id}`)}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            View Recipe
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Recipe;
