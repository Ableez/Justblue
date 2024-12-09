"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  useSignIn,
  useUser,
  useSignUp,
  useAuth,
  useSession,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { OAuthStrategy } from "@clerk/types";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Info } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const { signIn, isLoaded } = useSignIn();
  const { isSignedIn } = useSession();
  const { user } = useUser();
  const { signUp, setActive } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [loadingStrategy, setLoadingStrategy] = useState<OAuthStrategy | null>(
    null,
  );
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  const handleOauthSignIn = async (strategy: OAuthStrategy) => {
    try {
      setLoadingStrategy(strategy);
      setError("");

      if (!signIn || !signUp) return;

      // Handle existing accounts that need to be connected
      const userExistsButNeedsToSignIn =
        signUp.verifications?.externalAccount?.status === "transferable" &&
        signUp.verifications?.externalAccount?.error?.code ===
          "external_account_exists";

      if (userExistsButNeedsToSignIn) {
        const result = await signIn.create({ transfer: true });
        if (result.status === "complete" && result.createdSessionId) {
          await setActive?.({ session: result.createdSessionId });
          router.refresh();
          return;
        }
      }

      // Handle new accounts that need to be created
      const userNeedsToBeCreated =
        signIn.firstFactorVerification?.status === "transferable";

      if (userNeedsToBeCreated) {
        const result = await signUp.create({ transfer: true });
        if (result.status === "complete" && result.createdSessionId) {
          await setActive?.({ session: result.createdSessionId });
          router.refresh();

          return;
        }
      }

      // Regular OAuth flow
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sign-up/sso_callback",
        redirectUrlComplete: "/",
      });
    } catch (err) {
      toast({
        title: "Authentication Error",
        description: "Failed to connect with provider",
        variant: "destructive",
      });
    } finally {
      setLoadingStrategy(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn?.create({
        identifier: email,
        password,
      });

      if (result?.status === "complete") {
        toast({
          title: "Success",
          description: "Successfully signed in",
        });
        router.push("/");
      }
    } catch (err) {
      console.error("[ERROR SIGNING IN]", err);
      const cErr = err as { message: string };
      setError(
        cErr.message ??
          `Wrong ${email.split("").includes("@") ? "email" : "username"} or password`,
      );
      toast({
        title: "Authentication Error",
        description:
          cErr.message ??
          `Wrong ${email.split("").includes("@") ? "email" : "username"} or password`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = prompt("Please enter your email");
    if (!email) return;

    try {
      await signIn?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      toast({
        title: "Success",
        description: "Reset email sent successfully",
      });

      router.push("/reset-password");
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send reset email",
        variant: "destructive",
      });
    }
  };

  if (!isLoaded) return null;

  return (
    <div
      className={
        "grid min-h-screen w-screen place-items-center p-4 py-16 md:p-8"
      }
    >
      <h4 className="text-xl font-bold">Log in to your account</h4>
      {user?.emailAddresses[0]?.emailAddress}
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="relative flex w-full flex-col gap-2 pt-8"
        >
          {error ? (
            <p className="absolute left-1/2 top-0 mb-2 flex w-full -translate-x-1/2 place-items-center justify-center gap-2 align-middle text-xs text-red-500">
              <Info width={12} color={"#eb0000"} />
              {error}
            </p>
          ) : null}
          <Input
            name="email"
            type="text"
            className="h-12 w-full text-sm"
            placeholder="username, or email"
            required
          />
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              className="h-12 w-full pr-10 text-sm"
              placeholder="password"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-12 w-12 px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-neutral-500" />
              ) : (
                <Eye className="h-4 w-4 text-neutral-500" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full !bg-blue-600 font-semibold !text-white duration-300 hover:!bg-blue-700"
          >
            {isLoading ? "Signing in..." : "Log in"}
          </Button>
        </form>
        <div className="mx-auto flex w-full max-w-md flex-col place-items-center justify-between gap-4 p-4 align-middle text-neutral-300 dark:text-neutral-600 md:flex-row">
          <div id="clerk-captcha" />
        </div>
        <Button
          className="h-12"
          variant="ghost"
          onClick={handleForgotPassword}
          disabled={isLoading}
        >
          Forgotten password?
        </Button>

        <div className="relative h-10 w-full">
          <Separator
            className={"absolute left-0 right-0 top-1/2 -translate-y-1/2"}
          />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 text-neutral-500 dark:bg-black dark:text-neutral-600">
            Or
          </span>
        </div>

        <div className="flex w-full flex-col gap-1">
          <Button
            className="group h-12 w-full"
            variant="outline"
            onClick={() => handleOauthSignIn("oauth_x")}
            disabled={loadingStrategy !== null}
          >
            <div className="grid h-10 w-10 place-items-center rounded-sm bg-neutral-950 transition-all duration-200 ease-in group-hover:bg-neutral-800">
              {loadingStrategy === "oauth_x" ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Image
                  src={"/image/x.svg"}
                  width={18}
                  height={18}
                  alt={"X Icon"}
                />
              )}
            </div>
            {loadingStrategy === "oauth_x"
              ? "Connecting..."
              : "Continue with X"}
          </Button>
          <Button
            className="group h-12 w-full"
            variant="outline"
            onClick={() => handleOauthSignIn("oauth_apple")}
            disabled={loadingStrategy !== null}
          >
            <div className="grid h-10 w-10 place-items-center rounded-sm bg-neutral-950 transition-all duration-200 ease-in group-hover:bg-neutral-800">
              {loadingStrategy === "oauth_apple" ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Image
                  src={"/image/apple.svg"}
                  width={20}
                  height={20}
                  alt={"Apple Icon"}
                />
              )}
            </div>
            {loadingStrategy === "oauth_apple"
              ? "Connecting..."
              : "Continue with Apple"}
          </Button>
          <Button
            className="group h-12 w-full"
            variant="outline"
            onClick={() => handleOauthSignIn("oauth_google")}
            disabled={loadingStrategy !== null}
          >
            <div className="grid h-10 w-10 place-items-center rounded-sm bg-neutral-950 transition-all duration-200 ease-in group-hover:bg-neutral-800">
              {loadingStrategy === "oauth_google" ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Image
                  src={"/image/google.svg"}
                  width={20}
                  height={20}
                  alt={"G Icon"}
                />
              )}
            </div>
            {loadingStrategy === "oauth_google"
              ? "Connecting..."
              : "Continue with Google"}
          </Button>
        </div>
      </div>
      <div className="w-full">
        <Button
          className="h-12 w-full"
          variant={"link"}
          onClick={() => router.push("/sign-up")}
          disabled={isLoading}
        >
          New here? Sign Up
        </Button>
      </div>

      <div className="relative h-10 w-full">
        <Separator
          className={"absolute left-0 right-0 top-1/2 -translate-y-1/2"}
        />
      </div>

      <div className="mx-auto flex max-w-md flex-col place-items-center justify-between gap-4 p-4 align-middle text-neutral-300 dark:text-neutral-600 md:flex-row">
        {[
          { title: "© 2024", link: null },
          { title: "Justblue Terms", link: "/terms" },
          { title: "Privacy Policy", link: "/privacy" },
          { title: "Report a problem", link: "/support" },
        ].map(({ title, link }, idx) => (
          <Link
            key={link}
            className="text-xs font-semibold transition-all duration-300 ease-in hover:text-neutral-500 dark:hover:text-white"
            href={link ?? ""}
          >
            {title}
          </Link>
        ))}
      </div>
    </div>
  );
}
