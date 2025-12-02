interface NewRecipeType {
  id: string;
  title: string;
  dateAdded: string;
  image: string | null;
  servings: number;
  cookTime: number;
  description?: string;
  user: {
    _id: string;
    userName: string;
    userProfilePicture: string | null;
  };
  category: {
    _id: string;
    categoryName: string;
  };
}

export default NewRecipeType;
