/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { api } from "@/trpc/server";
import type {
  UserDataType,
  UpdateUserDataType,
} from "@/server/api/routers/user";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { inngestClient } from "../client";

// Function to handle user creation
export const createUserFunction = inngestClient.createFunction(
  { id: "justblue-create-user" },
  { event: "justblue/user.created" },
  async ({ event, logger }) => {
    const userData = event.data as UserDataType;
    logger.info("Creating user", { userId: userData.id });

    const { email_addresses, primary_email_address_id, ...rest } = userData;
    const primaryEmail = email_addresses.find(
      (email) => email.id === primary_email_address_id
    );

    if (!primaryEmail) {
      logger.error("Primary email not found", { userId: userData.id });
      throw new Error("Primary email not found");
    }

    try {
      await api.user.create(userData);
      logger.info("User created successfully", { userId: userData.id });
      return { status: "success", userId: userData.id };
    } catch (error) {
      logger.error("Error creating user", { error, userId: userData.id });
      throw error;
    }
  }
);

// Function to handle user updates
export const updateUserFunction = inngestClient.createFunction(
  { id: "justblue-update-user" },
  { event: "justblue/user.updated" },
  async ({ event, logger }) => {
    // Transform webhook data to match the expected schema
    const updateData: UpdateUserDataType = {
      id: event.data.id,
      email: event.data.email_addresses?.[0]?.email_address,
      emailVerified:
        event.data.email_addresses?.[0]?.verification?.status === "verified",
      imageUrl: event.data.image_url,
      profileImageUrl: event.data.profile_image_url,
      username: event.data.username,
      firstName: event.data.first_name,
      lastName: event.data.last_name,
      birthday: event.data.birthday,
      gender: event.data.gender as
        | "MALE"
        | "FEMALE"
        | "OTHER"
        | "PREFER_NOT_TO_SAY",
      passwordEnabled: event.data.password_enabled,
      twoFactorEnabled: event.data.two_factor_enabled,
      externalId: event.data.external_id,
      metadata: event.data.public_metadata,
      lastSignInAt: event.data.last_sign_in_at,
      disabled: event.data.banned,
    };

    logger.info("Updating user", { userId: updateData.id });

    try {
      await api.user.update(updateData);
      logger.info("User updated successfully", { userId: updateData.id });
      return { status: "success", userId: updateData.id };
    } catch (error) {
      logger.error("Error updating user", { error, userId: updateData.id });
      throw error;
    }
  }
);

// Function to handle user deletion
export const deleteUserFunction = inngestClient.createFunction(
  { id: "justblue-delete-user" },
  { event: "justblue/user.deleted" },
  async ({ event, logger }) => {
    const userData = event.data as WebhookEvent["data"];

    if (!userData.id) {
      logger.error("User ID is missing");
      throw new Error("User ID is missing");
    }

    logger.info("Soft deleting user", { userId: userData.id });

    try {
      await api.user.softDelete({ id: userData.id });
      logger.info("User soft deleted successfully", { userId: userData.id });
      return { status: "success", userId: userData.id };
    } catch (error) {
      logger.error("Error soft deleting user", { error, userId: userData.id });
      throw error;
    }
  }
);

// TODO: TEST THE CURRENT SETUP AND MAKE SURE IT WORKS

// Export all functions
export const userFunctions = {
  createUserFunction,
  updateUserFunction,
  deleteUserFunction,
};
