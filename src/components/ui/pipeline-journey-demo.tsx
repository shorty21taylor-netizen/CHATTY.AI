"use client";

import { useMemo } from "react";
import { Player } from "@remotion/player";
import { PipelineJourney } from "@/components/ui/pipeline-journey";

export default function PipelineJourneyDemo() {
  const props = useMemo(() => ({
    speed: 1,
  }), []);

  return (
    <div className="flex w-full min-h-screen items-center justify-center overflow-hidden bg-background p-6 md:p-10">
      <div className="w-full max-w-[1200px]">
        <Player
          component={PipelineJourney as any}
          inputProps={props}
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
            borderRadius: 24,
            overflow: "hidden",
            background: "#050505",
            boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
          }}
        />
      </div>
    </div>
  );
}
