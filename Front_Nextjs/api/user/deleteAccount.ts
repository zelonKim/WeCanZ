import { client } from "../client";

export const deleteAccount = async () => {
  try {
    const { data } = await client.delete("/user/account");
    return data;
  } catch (error: any) {
    console.log(error.response?.status, error.response?.data);
  }
};
