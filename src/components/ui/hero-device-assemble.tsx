"use client";

import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface HeroDeviceAssembleProps {
  accentColor?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Layout constants                                                    */
/* ------------------------------------------------------------------ */
const LID_W = 860;
const LID_H = 540;
const BASE_H = 24;
const BEZEL_SIDE = 38;
const BEZEL_TOP = 26;
const BEZEL_BOT = 40;
const SCREEN_W = LID_W - BEZEL_SIDE * 2;
const SCREEN_H = LID_H - BEZEL_TOP - BEZEL_BOT;
const CANVAS_W = 1280;
const CANVAS_H = 720;

/* ------------------------------------------------------------------ */
/* Mini-dashboard rendered inside the laptop screen                    */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { label: "Today", active: true },
  { label: "Speed to Lead" },
  { label: "Booked Calls" },
  { label: "Follow-Ups" },
  { label: "Proposals" },
  { label: "Pipeline" },
  { label: "Agents" },
];

function MockDashboard({ accent }: { accent: string }) {
  const tint = "#E8F5EE";
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#ffffff",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 168,
          background: "#fafafa",
          borderRight: "1px solid #e4e4e7",
          padding: "14px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "4px 8px",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}
            >
              C
            </span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#18181b" }}>
            Chatty AI
          </span>
        </div>

        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              fontSize: 10.5,
              fontWeight: item.active ? 600 : 500,
              color: item.active ? accent : "#71717a",
              background: item.active ? tint : "transparent",
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "16px 20px", overflow: "hidden" }}>
        {/* Eyebrow */}
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a1a1aa",
            marginBottom: 4,
          }}
        >
          Command Center
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#18181b",
            marginBottom: 14,
            letterSpacing: "-0.02em",
          }}
        >
          Today
        </div>

        {/* Revenue hero card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e4e4e7",
            borderLeft: `3px solid ${accent}`,
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: accent,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Revenue from AI
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "#18181b",
              marginTop: 4,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            $47,280
          </div>
          <span
            style={{
              display: "inline-block",
              fontSize: 9,
              fontWeight: 700,
              background: tint,
              color: accent,
              padding: "2px 8px",
              borderRadius: 99,
              marginTop: 6,
            }}
          >
            +15% ↑
          </span>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <MiniStat label="Leads Contacted" value="47" accent={accent} />
          <MiniStat label="Booked Calls" value="18" accent="#3b82f6" />
          <MiniStat label="Active Follow-Ups" value="142" accent="#8b5cf6" />
        </div>

        {/* Bar chart */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e4e4e7",
            borderRadius: 8,
            padding: "10px 14px",
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#a1a1aa",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 10,
            }}
          >
            Agent Activity
          </div>
          <MiniBarChart accent={accent} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e4e4e7",
        borderRadius: 6,
        padding: "8px 10px",
      }}
    >
      <div
        style={{
          fontSize: 8,
          fontWeight: 600,
          color: "#a1a1aa",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "#18181b",
          marginTop: 2,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 8, fontWeight: 600, color: accent, marginTop: 3 }}>
        +12% ↑
      </div>
    </div>
  );
}

function MiniBarChart({ accent }: { accent: string }) {
  const bars = [55, 40, 72, 48, 65, 85, 58];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          height: 64,
        }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h}%`,
              background: i === 5 ? accent : `${accent}30`,
              borderRadius: 3,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {days.map((d, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 7,
              color: "#a1a1aa",
              fontWeight: 600,
            }}
          >
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main composition                                                    */
/* ------------------------------------------------------------------ */

export function HeroDeviceAssemble({
  accentColor = "#0F8A4F",
  className,
}: HeroDeviceAssembleProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ---- Phase 1: Assembly (lid drops, base rises) ---- */
  const lidSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 13, stiffness: 70, mass: 0.9 },
    durationInFrames: 45,
  });
  const baseSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 13, stiffness: 70, mass: 0.9 },
    durationInFrames: 45,
  });

  const lidY = interpolate(lidSpring, [0, 1], [-320, 0]);
  const lidOpacity = interpolate(lidSpring, [0, 0.15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const baseY = interpolate(baseSpring, [0, 1], [220, 0]);
  const baseOpacity = interpolate(baseSpring, [0, 0.15], [0, 1], {
    extrapolateRight: "clamp",
  });

  /* ---- Phase 2: Bezel sharpens (border highlight) ---- */
  const bezelGlow = interpolate(frame, [45, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* ---- Phase 3: Screen turns on, then MockUI appears ---- */
  const screenOn = interpolate(frame, [52, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mockOpacity = interpolate(frame, [68, 92], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  /* ---- Phase 4: Shimmer sweep ---- */
  const shimmerT = interpolate(frame, [96, 132], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shimmerX = interpolate(shimmerT, [0, 1], [-20, 120]);

  /* ---- Hold phase: float + glow pulse ---- */
  const floatY = frame > 95 ? Math.sin((frame - 95) * 0.04) * 3 : 0;
  const glowOpacity =
    frame > 80 ? 0.35 + Math.sin((frame - 80) * 0.055) * 0.2 : 0;

  /* ---- 3D tilt builds as parts assemble ---- */
  const tilt = interpolate(lidSpring, [0, 1], [0, 8]);

  /* ---- Layout ---- */
  const laptopLeft = (CANVAS_W - LID_W) / 2;
  const laptopTop = (CANVAS_H - LID_H - BASE_H) / 2;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "transparent",
      }}
    >
      {/* 3D perspective wrapper */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: 1800,
          perspectiveOrigin: "50% 42%",
        }}
      >
        {/* Laptop group */}
        <div
          style={{
            position: "absolute",
            left: laptopLeft,
            top: laptopTop,
            width: LID_W,
            transform: `rotateX(${tilt}deg) translateY(${floatY}px)`,
            transformStyle: "preserve-3d",
            transformOrigin: "center bottom",
          }}
        >
          {/* ---- LID (screen housing) ---- */}
          <div
            style={{
              width: LID_W,
              height: LID_H,
              borderRadius: "16px 16px 4px 4px",
              background: "#1a1a1a",
              transform: `translateY(${lidY}px)`,
              opacity: lidOpacity,
              boxShadow: `0 -2px 40px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,${0.04 + bezelGlow * 0.06})`,
              padding: `${BEZEL_TOP}px ${BEZEL_SIDE}px ${BEZEL_BOT}px`,
              position: "relative",
            }}
          >
            {/* Webcam dot */}
            <div
              style={{
                position: "absolute",
                top: 10,
                left: "50%",
                transform: "translateX(-50%)",
                width: 6,
                height: 6,
                borderRadius: 99,
                background: "#2a2a2a",
                border: "1px solid #333",
              }}
            />

            {/* Screen */}
            <div
              style={{
                width: SCREEN_W,
                height: SCREEN_H,
                borderRadius: 6,
                overflow: "hidden",
                position: "relative",
                background: "#09090b",
                boxShadow:
                  bezelGlow > 0
                    ? `0 0 ${20 * bezelGlow}px ${accentColor}15, inset 0 0 0 1px rgba(255,255,255,${0.05 * bezelGlow})`
                    : "none",
              }}
            >
              {/* Screen-on white layer */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#ffffff",
                  opacity: screenOn,
                  borderRadius: 6,
                }}
              />

              {/* MockUI */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: mockOpacity,
                }}
              >
                <MockDashboard accent={accentColor} />
              </div>

              {/* Shimmer sweep */}
              {shimmerT > 0 && shimmerT < 1 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(105deg, transparent ${shimmerX - 18}%, rgba(255,255,255,0.35) ${shimmerX - 4}%, rgba(255,255,255,0.6) ${shimmerX}%, rgba(255,255,255,0.35) ${shimmerX + 4}%, transparent ${shimmerX + 18}%)`,
                    borderRadius: 6,
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          </div>

          {/* ---- BASE (keyboard/trackpad) ---- */}
          <div
            style={{
              width: LID_W,
              height: BASE_H,
              borderRadius: "0 0 8px 8px",
              background: "linear-gradient(180deg, #252525 0%, #1a1a1a 100%)",
              transform: `translateY(${baseY}px)`,
              opacity: baseOpacity,
              boxShadow:
                "0 6px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
              position: "relative",
            }}
          >
            {/* Trackpad hint */}
            <div
              style={{
                position: "absolute",
                top: 6,
                left: "50%",
                transform: "translateX(-50%)",
                width: 160,
                height: 10,
                borderRadius: 4,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Green glow underneath laptop */}
      {glowOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "10%",
            width: LID_W * 0.6,
            height: 50,
            transform: "translateX(-50%)",
            background: `radial-gradient(ellipse, ${accentColor}25, transparent 70%)`,
            opacity: glowOpacity,
            filter: "blur(24px)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
