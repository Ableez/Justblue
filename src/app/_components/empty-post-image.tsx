"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const EmptyStateImage = () => {
  const [image, setImage] = useState<string | null>(null);

  const { theme } = useTheme();

  useEffect(() => {
    if (theme === "dark") {
      setImage(
        "https://utfs.io/f/wGHSFKxTYo2eVJjtr6enR487aEVXgQZGtMIvj5oHNueC0scJ",
      );
    } else {
      setImage(
        "https://utfs.io/f/wGHSFKxTYo2eCLEJDXNF9UGFS24IRls6T3uqNyZY0W1nBpQa",
      );
    }
  }, [theme]);
  return image ? (
    <Image src={image} alt="Empty feed" width={300} height={300} />
  ) : null;
};

export default EmptyStateImage;
