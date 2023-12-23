"use server";

import { revalidatePath } from "next/cache";

import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface UserUpdateI {
  userid: string;
  username: string;
  name: string;
  image: string;
  bio: string;
  path: string;
}

export const updateUser = async ({
  userid,
  username,
  name,
  image,
  bio,
  path,
}: UserUpdateI): Promise<void> => {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      { id: userid },
      {
        username: username.toLowerCase(),
        userid,
        name,
        image,
        bio,
        onboarded: true,
      },
      // will update existing row if found, otherwise create new
      { upsert: true }
    );

    if (path === "/profile/edit") {
      // allows to clear cached data on-demand
      revalidatePath(path);
    }
  } catch (err: any) {
    throw new Error(`Failed to create/update user: ${err.message}`);
  }
};

// TODO: add return type
export const fetchUser = async (userId: string) => {
  try {
    connectToDB();

    // TODO: add type
    const user = await User.findOne({ id: userId });
    // .populate({
    //   path: "communities",
    //   model: "Community",
    // });

    if (!user) {
      throw new Error("User not found");
    }

    return user;

    // TODO: add type
  } catch (err: any) {
    throw new Error(`Failed to fetch user: ${err.message}`);
  }
};
