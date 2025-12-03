import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getRecipes, createRecipe, Recipe as ApiRecipe, RecipeQueryParams } from "@/services/recipes";
import { useAuth } from "./AuthContext";

export interface Recipe {
  id: string;
  name?: string;
  title?: string;
  date?: string;
  image: string | null;
  description?: string;
  category_id?: string;
  [key: string]: any;
}

interface RecipesContextType {
  myRecipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  addRecipe: (recipe: Partial<Recipe>) => Promise<void>;
  refreshRecipes: (params?: RecipeQueryParams) => Promise<void>;
}

const RecipesContext = createContext<RecipesContextType | undefined>(undefined);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch recipes on mount and when user changes
  useEffect(() => {
    if (user) {
      refreshRecipes({ user_id: user.id });
    } else {
      setMyRecipes([]);
      setIsLoading(false);
    }
  }, [user?.id]);

  const refreshRecipes = async (params?: RecipeQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const recipes = await getRecipes(params);
      // Map API response to match our Recipe interface
      const mappedRecipes = recipes.map((recipe: ApiRecipe) => ({
        ...recipe,
        name: recipe.title || recipe.name,
        date: recipe.date || recipe.createdAt || new Date().toISOString(),
      }));
      setMyRecipes(mappedRecipes);
    } catch (err: any) {
      console.error("Error fetching recipes:", err);
      setError(err?.message || "Failed to fetch recipes");
    } finally {
      setIsLoading(false);
    }
  };

  const addRecipe = async (recipe: Partial<Recipe>) => {
    try {
      setError(null);
      const newRecipe = await createRecipe(recipe);
      // Map API response
      const mappedRecipe = {
        ...newRecipe,
        name: newRecipe.title || newRecipe.name,
        date: newRecipe.date || newRecipe.createdAt || new Date().toISOString(),
      };
      setMyRecipes((prev) => [mappedRecipe, ...prev]);
    } catch (err: any) {
      console.error("Error creating recipe:", err);
      setError(err?.message || "Failed to create recipe");
      throw err;
    }
  };

  return (
    <RecipesContext.Provider value={{ myRecipes, isLoading, error, addRecipe, refreshRecipes }}>
      {children}
    </RecipesContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipesContext);
  if (context === undefined) {
    throw new Error("useRecipes must be used within a RecipesProvider");
  }
  return context;
}

