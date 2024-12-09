"use client";

import { useEffect, useState } from "react";
import { useAuth, useSession, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { IconReload } from "@tabler/icons-react";
import type { OAuthStrategy } from "@clerk/types";

const VerificationSchema = z.object({
  code: z.string().min(6, {
    message: "Verification code must be 6 characters.",
  }),
});

const SignUp = () => {
  const router = useRouter();
  const { signUp, isLoaded, setActive } = useSignUp();
  const [loadingStrategy, setLoadingStrategy] = useState<OAuthStrategy | null>(
    null,
  );
  const { isSignedIn } = useSession();
  const [resendingVerification, setResendingVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    if (isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  useEffect(() => {
    // check if there is a pending email verification
    if (signUp?.verifications?.emailAddress?.status === "unverified") {
      setVerifying(true);
    }
  }, [signUp]);

  const form = useForm<z.infer<typeof VerificationSchema>>({
    resolver: zodResolver(VerificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!isLoaded) return;

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const username = formData.get("username") as string;

    try {
      const sn = await signUp.create({
        emailAddress: email,
        password,
        username,
        redirectUrl: "/sso_callback",
      });

      console.log("SIGNUP CREATE", sn);

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch (err) {
      const cErr = err as { message: string };
      setError(cErr.message ?? "Failed to create account");
      console.error("ERROR SIGNUP CREATE", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (data: z.infer<typeof VerificationSchema>) => {
    setIsLoading(true);
    try {
      const completeSignUp = await signUp?.attemptEmailAddressVerification({
        code: data.code,
      });

      if (
        completeSignUp?.status === "complete" &&
        completeSignUp?.createdSessionId
      ) {
        await setActive?.({ session: completeSignUp.createdSessionId });
        router.push("/");
      }
    } catch (err) {
      console.log("ERROR SIGNUP VERIFY", err);
      toast({
        title: "Error",
        description: "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOauthSignIn = async (strategy: OAuthStrategy) => {
    try {
      setLoadingStrategy(strategy);
      setError("");

      if (!signUp) {
        console.log("ERROR SIGNUP OAUTH", signUp);
      }
      await signUp?.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso_callback",
        redirectUrlComplete: "/",
        continueSignUp: true,
      });

      console.log("SN", signUp?.missingFields);
      if (signUp?.missingFields && signUp?.missingFields.length > 0) {
        setMissingFields(signUp?.missingFields);
      }

      console.log("SIGNUP OAUTH", strategy);
    } catch (err) {
      console.log("ERROR SIGNUP OAUTH", err);
      setError("Failed to connect with provider");
    } finally {
      setLoadingStrategy(null);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="grid min-h-screen w-screen place-items-center p-4 py-16 md:p-8">
      <h4 className="text-xl font-bold">
        {!verifying && "Create your account"}
      </h4>

      <div className="mx-auto flex w-full max-w-sm flex-col gap-4 py-8">
        {verifying ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleVerify)}
              className="w-full space-y-4"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="pb-8 text-3xl">
                      Enter the 6-Digit code we sent to your email
                    </FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                        className="gap-2"
                      >
                        <InputOTPGroup className="mt-8 w-full">
                          <InputOTPSlot className={"h-12 w-full"} index={0} />
                          <InputOTPSlot className={"h-12 w-full"} index={1} />
                          <InputOTPSlot className={"h-12 w-full"} index={2} />
                          <InputOTPSlot className={"h-12 w-full"} index={3} />
                          <InputOTPSlot className={"h-12 w-full"} index={4} />
                          <InputOTPSlot className={"h-12 w-full"} index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  resendingVerification ||
                  form.formState.isSubmitting
                }
                className="h-12 w-full !bg-blue-600 font-semibold !text-white duration-300 hover:!bg-blue-700"
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>
              <Button
                type="button"
                disabled={isLoading}
                variant={"ghost"}
                className="h-12 w-full"
                onClick={async () => {
                  // implement logic to resend verification code
                  setResendingVerification(true);
                  try {
                    await signUp.prepareEmailAddressVerification({
                      strategy: "email_code",
                    });
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setResendingVerification(true);
                  }
                }}
              >
                {resendingVerification && (
                  <IconReload className="animate-spin" />
                )}
                {resendingVerification ? "Resending..." : "Resend Code"}
              </Button>
            </form>
          </Form>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-2"
            >
              {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
              <Input
                name="username"
                type="username"
                className="h-12 w-full text-sm"
                placeholder="ableez"
                required
              />
              <Input
                name="email"
                type="email"
                className="h-12 w-full text-sm"
                placeholder="example@mail.com"
                required
              />
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="h-12 w-full pr-10 text-sm"
                  placeholder="Create a password"
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
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>
            </form>

            <div className="mx-auto flex w-full max-w-md flex-col place-items-center justify-between gap-4 p-4 align-middle text-neutral-300 dark:text-neutral-600 md:flex-row">
              <div id="clerk-captcha" />
            </div>

            <div className="relative h-10 w-full">
              <Separator className="absolute left-0 right-0 top-1/2 -translate-y-1/2" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 text-neutral-500 dark:bg-black dark:text-neutral-600">
                Or
              </span>
            </div>

            <div className="flex w-full flex-col gap-1">
              <Button
                className="group h-12 w-full"
                variant="outline"
                onClick={() => handleOauthSignIn("oauth_twitter")}
                disabled={loadingStrategy !== null}
              >
                <div className="grid h-10 w-10 place-items-center rounded-sm bg-neutral-950 transition-all duration-200 ease-in group-hover:bg-neutral-800">
                  {loadingStrategy === "oauth_x" ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Image
                      src="/image/x.svg"
                      width={18}
                      height={18}
                      alt="X Icon"
                    />
                  )}
                </div>
                {loadingStrategy === "oauth_twitter"
                  ? "Connecting..."
                  : "Sign up with X"}
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
                  : "Sign up with Apple"}
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
                  : "Sign up with Google"}
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="w-full">
        <Button
          className="h-12 w-full"
          variant={"link"}
          onClick={() => router.push("/sign-in")}
          disabled={isLoading}
        >
          Been here before? Sign in
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
        ].map(({ title, link }) => (
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
};

export default SignUp;
