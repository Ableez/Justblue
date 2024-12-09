"use client";
import { AuthenticateWithRedirectCallback, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

const SSOCallbackPath = () => {
  const { handleRedirectCallback } = useClerk();

  useEffect(() => {
    const fn = async () =>
      await handleRedirectCallback({
        signInUrl: "/sign-in",
        signUpUrl: "/sign-up",
      });

    void fn();
  }, [handleRedirectCallback]);

  return <AuthenticateWithRedirectCallback />;
};

export default SSOCallbackPath;
