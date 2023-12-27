"use server";

import { revalidatePath } from "next/cache";

import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";

interface UserUpdateI {
  userId: string;
  username: string;
  name: string;
  image: string;
  bio: string;
  path: string;
}

export const updateUser = async ({
  userId,
  username,
  name,
  image,
  bio,
  path,
}: UserUpdateI): Promise<void> => {
  try {
    connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
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

    return await User.findOne({ id: userId });
    // .populate({
    //   path: "communities",
    //   model: Community,
    // });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
};

export const fetchUserPosts = async (accountId: string) => {
  try {
    connectToDB();

    // Find all threads authored by the user with the given userId
    const threads = await User.findOne({ id: accountId }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id",
          },
        },
      ],
    });
    return threads;
  } catch (err: any) {
    throw new Error(`Failed to fetch user posts: ${err.message}`);
  }
};
