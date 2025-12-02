interface RecipeType {
  id: string;
  title: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  comments: number;
  image: string | null;
  servings: number;
  cookTime: number;
  description?: string;
  user: {
    _id: string;
    userName: string;
    userProfilePicture: string | null;
  };
  category: Array<{
    _id: string;
    categoryName: string;
  }>;
}

export default RecipeType;
