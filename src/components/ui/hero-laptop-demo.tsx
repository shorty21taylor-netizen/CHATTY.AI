"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

const RemotionPlayer = dynamic(
  () => import("@remotion/player").then((mod) => mod.Player),
  { ssr: false }
);

const HeroDeviceAssemble = dynamic(
  () =>
    import("@/components/ui/hero-device-assemble").then(
      (mod) => mod.HeroDeviceAssemble
    ),
  { ssr: false }
);

export default function HeroLaptopDemo() {
  const inputProps = useMemo(
    () => ({ accentColor: "#0F8A4F", device: "laptop" as const, speed: 1 }),
    []
  );

  if (!RemotionPlayer || !HeroDeviceAssemble) return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <RemotionPlayer
        component={HeroDeviceAssemble as any}
        inputProps={inputProps}
        durationInFrames={240}
        fps={30}
        compositionWidth={1280}
        compositionHeight={720}
        autoPlay
        loop
        controls={false}
        clickToPlay={false}
        style={{
          width: "100%",
          height: "auto",
          aspectRatio: "16 / 9",
          borderRadius: 20,
          overflow: "hidden",
          background: "transparent",
        }}
      />
    </div>
  );
}
