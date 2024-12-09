import { Webhook } from "svix";
import { headers } from "next/headers";
import { env } from "@/env";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { api } from "@/trpc/server";
import type { UserDataType } from "@/server/api/routers/user";

type UpdateUserEvtData = {
  id: string;
  first_name: string;
  email_addresses: {
    email_address: string;
  }[];
  last_name: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  profile_image_url: string;
  image_url: string;
  username: string;
  birthday: string;
  created_at: string;
  updated_at: string;
  external_id: string;
  public_metadata: Record<string, string>;
  banned: boolean;
  last_sign_in_at: number;
};

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint

  if (!env.WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const wh = new Webhook(env.WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle different event types
  switch (evt.type) {
    case "user.created":
      await handleUserCreated(evt.data as UserDataType);
      break;
    case "user.updated":
      await handleUserUpdated(evt.data as unknown as UpdateUserEvtData);
      break;
    case "user.deleted":
      await handleUserDeleted(evt.data);
      break;
    // Add more cases as needed
    default:
      console.log(`Unhandled event type: ${evt.type}`);
  }

  return new Response("", { status: 200 });
}

async function handleUserCreated(userData: UserDataType) {
  console.log("User created", {
    id: userData.id,
    email_addresses: userData.email_addresses,
    primary_email_address_id: userData.primary_email_address_id,
    username: userData.username,
    first_name: userData.first_name,
    last_name: userData.last_name,
    image_url: userData.image_url,
    profile_image_url: userData.profile_image_url,
    birthday: userData.birthday,
    gender: userData.gender,
    password_enabled: userData.password_enabled,
    two_factor_enabled: userData.two_factor_enabled,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
    external_id: userData.external_id,
  });

  await api.user.create({
    id: userData.id,
    email_addresses: userData.email_addresses,
    primary_email_address_id: userData.primary_email_address_id,
    username: userData.username,
    first_name: userData.first_name,
    last_name: userData.last_name,
    image_url: userData.image_url,
    profile_image_url: userData.profile_image_url,
    birthday: userData.birthday ?? "",
    gender: userData.gender ?? "PREFER_NOT_TO_SAY",
    password_enabled: userData.password_enabled,
    two_factor_enabled: userData.two_factor_enabled,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
    external_id: userData.external_id,
    metadata: userData.metadata,
  });
}

async function handleUserUpdated(userData: UpdateUserEvtData) {
  console.log("update user", userData);
  await api.user.update({
    id: userData.id,
    firstName: userData.first_name,
    email: userData.email_addresses[0]?.email_address,
    lastName: userData.last_name,
    gender: userData.gender || "PREFER_NOT_TO_SAY",
    profileImageUrl: userData.profile_image_url,
    imageUrl: userData.image_url,
    username: userData.username,
    metadata: userData.public_metadata,
    birthday: userData.birthday,
    externalId: userData.external_id,
    lastSignInAt: userData.last_sign_in_at,
    disabled: userData.banned,
  });
}

async function handleUserDeleted(userData: WebhookEvent["data"]) {
  if (!userData.id) {
    console.error("User ID is missing");
    return;
  }

  await api.user.softDelete({ id: userData.id });
}
