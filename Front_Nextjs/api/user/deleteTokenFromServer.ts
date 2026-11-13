import { client } from "../client";

export const deleteTokenFromServer = async () => {
  try {
    await client.delete("/user/push-token");
  } catch (error) {
    console.log(error);
  }
};
