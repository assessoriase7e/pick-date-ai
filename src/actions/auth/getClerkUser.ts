"use server";

import { currentUser, User } from "@clerk/nextjs/server";

export const getClerkUser = async (): Promise<User> => {
  const user = await currentUser();
  return JSON.parse(JSON.stringify(user));
};
