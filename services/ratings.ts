import api from "./api";

export interface Rating {
  id?: string;
  _id?: string;
  recipe_id: string;
  user_id: string;
  rating: number; // 1-5
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface RatingQueryParams {
  recipe_id?: string;
  user_id?: string;
}

// Get all ratings (supports query params)
export const getRatings = async (
  params?: RatingQueryParams
): Promise<Rating[]> => {
  try {
    const response = await api.get<any>("/api/ratings", { params });

    // Handle different response structures
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    } else if (data?.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data?.ratings && Array.isArray(data.ratings)) {
      return data.ratings;
    } else {
      // If the endpoint doesn't exist or returns an error, return empty array silently
      if (data?.message && data?.message.includes("not found")) {
        return [];
      }
      // Only warn for unexpected structures that aren't "not found" errors
      if (!data?.success === false) {
        console.warn("Unexpected ratings response structure:", data);
      }
      return [];
    }
  } catch (error: any) {
    // Handle 404 or route not found errors silently
    if (
      error?.response?.status === 404 ||
      error?.message?.includes("not found") ||
      error?.response?.data?.message?.includes("not found")
    ) {
      // Endpoint doesn't exist yet, return empty array
      return [];
    }
    // Log other errors but still return empty array
    console.error("Error fetching ratings:", error);
    return [];
  }
};

// Get rating by ID
export const getRatingById = async (id: string): Promise<Rating> => {
  const response = await api.get<any>(`/api/ratings/${id}`);

  // Handle different response structures
  const data = response.data;

  // If response has a nested data property, use it
  if (
    data?.data &&
    typeof data.data === "object" &&
    !Array.isArray(data.data)
  ) {
    return data.data;
  }

  // Otherwise return the data directly
  return data;
};

// Get user's rating for a specific recipe
export const getUserRatingForRecipe = async (
  recipeId: string,
  userId: string
): Promise<Rating | null> => {
  try {
    const ratings = await getRatings({ recipe_id: recipeId, user_id: userId });
    return ratings.length > 0 ? ratings[0] : null;
  } catch (error) {
    console.error("Error fetching user rating:", error);
    return null;
  }
};

// Create or update rating
export const createOrUpdateRating = async (
  data: Partial<Rating>
): Promise<Rating> => {
  try {
    // Check if user already rated this recipe
    if (data.recipe_id && data.user_id) {
      try {
        const existingRating = await getUserRatingForRecipe(
          data.recipe_id,
          data.user_id
        );
        if (existingRating) {
          // Update existing rating
          const ratingId = existingRating.id || existingRating._id;
          if (ratingId) {
            return await updateRating(ratingId, { rating: data.rating });
          }
        }
      } catch (error) {
        // If getUserRatingForRecipe fails (endpoint doesn't exist), continue to create
        console.error("Error checking existing rating:", error);
      }
    }

    // Create new rating
    const response = await api.post<Rating>("/api/ratings", data);
    return response.data;
  } catch (error: any) {
    // Handle 404 or route not found errors
    if (
      error?.response?.status === 404 ||
      error?.message?.includes("not found") ||
      error?.response?.data?.message?.includes("not found")
    ) {
      throw new Error(
        "Ratings feature is not available yet. Please contact support."
      );
    }
    throw error;
  }
};

// Update rating
export const updateRating = async (
  id: string,
  data: Partial<Rating>
): Promise<Rating> => {
  const response = await api.put<Rating>(`/api/ratings/${id}`, data);
  return response.data;
};

// Delete rating
export const deleteRating = async (id: string): Promise<void> => {
  await api.delete(`/api/ratings/${id}`);
};

// Get average rating for a recipe
export const getRecipeAverageRating = async (
  recipeId: string
): Promise<number> => {
  try {
    const ratings = await getRatings({ recipe_id: recipeId });
    if (ratings.length === 0) return 0;

    const sum = ratings.reduce((acc, rating) => acc + (rating.rating || 0), 0);
    return sum / ratings.length;
  } catch (error) {
    // Silently return 0 if ratings endpoint doesn't exist
    return 0;
  }
};
