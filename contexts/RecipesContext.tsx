import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getRecipes, createRecipe, uploadRecipeImage, Recipe as ApiRecipe, RecipeQueryParams } from "@/services/recipes";
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
      const userId = user.id || user._id;
      if (userId) {
        refreshRecipes({ user_id: userId });
      }
    } else {
      setMyRecipes([]);
      setIsLoading(false);
    }
  }, [user?.id, user?._id]);

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
      
      // Ensure required fields are present
      // Backend requires: title, user_id, category_id
      const userId = user?.id || user?._id || '';
      const recipeData: any = {
        ...recipe,
        title: recipe.title || recipe.name || '',
        user_id: userId,
        category_id: recipe.category_id || '',
        // Include image if it exists - createRecipe will handle FormData conversion
        image: recipe.image || undefined,
      };
      
      console.log('Recipe data being sent:', { 
        title: recipeData.title, 
        user_id: recipeData.user_id, 
        category_id: recipeData.category_id,
        hasImage: !!recipeData.image,
        hasUser: !!user 
      });
      
      // Validate required fields
      if (!recipeData.title) {
        throw new Error('Recipe title is required');
      }
      if (!recipeData.user_id) {
        throw new Error('User ID is required. Please make sure you are logged in.');
      }
      if (!recipeData.category_id) {
        throw new Error('Category ID is required');
      }
      
      console.log('Creating recipe with data:', recipeData);
      
      // Create recipe (createRecipe will send as FormData if image is present)
      const newRecipe = await createRecipe(recipeData);
      
      console.log('Recipe created successfully:', newRecipe);
      
      // Map API response
      const mappedRecipe = {
        ...newRecipe,
        name: newRecipe.title || newRecipe.name,
        date: newRecipe.date || newRecipe.createdAt || new Date().toISOString(),
        image: newRecipe.image || recipe.image || null, // Use backend image URL if available
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

