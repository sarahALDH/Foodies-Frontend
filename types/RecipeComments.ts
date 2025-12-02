interface RecipeCommentsType {
  id: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  user: {
    _id: string;
    userName: string;
    userProfilePicture: string | null;
  };
}

export default RecipeCommentsType;
