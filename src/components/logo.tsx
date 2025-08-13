"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 136, height = 28, className }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const scaledWidth = Math.round(width * 1.2);
  const scaledHeight = Math.round(height * 1.2);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Image
        src="/logoLight.svg"
        alt="Doutor Agenda"
        width={scaledWidth}
        height={scaledHeight}
        className={`mx-auto ${className || ""}`}
      />
    );
  }

  const logoSrc = resolvedTheme === "dark" ? "/logoDark.svg" : "/logoLight.svg";

  return (
    <Image
      src={logoSrc}
      alt="Doutor Agenda"
      width={scaledWidth}
      height={scaledHeight}
      className={`mx-auto ${className || ""}`}
    />
  );
}
