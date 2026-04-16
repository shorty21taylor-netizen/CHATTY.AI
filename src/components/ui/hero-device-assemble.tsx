"use client";

import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface HeroDeviceAssembleProps {
  assembleStart?: number;
  device?: "laptop" | "phone";
  accentColor?: string;
  speed?: number;
  className?: string;
}

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

/* ------------------------------------------------------------------ */
/* Chatty AI Dashboard MockUI                                          */
/* ------------------------------------------------------------------ */

const GREEN = "#0F8A4F";
const GREEN_TINT = "#E8F5EE";
const GREEN_DARK = "#0A6B3C";

const NAV_ITEMS = [
  { label: "Today", active: true },
  { label: "Daily Brief" },
  { label: "Speed to Lead" },
  { label: "Booked Calls" },
  { label: "Follow-Ups" },
  { label: "Proposals Out" },
  { label: "Closed Revenue" },
  { label: "Agents" },
  { label: "Contacts" },
  { label: "Pipeline" },
];

const SELLERS = [
  { agent: "SPEED-TO-LEAD", value: "47", label: "leads in <60s", color: GREEN, bg: `rgba(15,138,79,0.10)` },
  { agent: "REACTIVATION", value: "23", label: "leads reawakened", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  { agent: "BOOKED CALLS", value: "18", label: "appointments", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  { agent: "QUOTES SENT", value: "12", label: "quotes + follow-ups", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { agent: "FOLLOW-UPS", value: "142", label: "texts sent", color: "#ec4899", bg: "rgba(236,72,153,0.12)" },
];

const QUALITY = [
  { label: "Answer Rate", value: "94.2%", delta: "+2.1%" },
  { label: "Time to Answer", value: "0.8s", delta: "-12%" },
  { label: "Qualification", value: "67%", delta: "+4%" },
  { label: "Booking Rate", value: "38%", delta: "+6%" },
];

function MockUI({ accentColor }: { accentColor: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        background: "#ffffff",
        fontFamily: FONT_FAMILY,
        color: "#18181b",
        overflow: "hidden",
      }}
    >
      {/* ---- Sidebar ---- */}
      <div
        style={{
          width: 180,
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
            gap: 8,
            padding: "6px 8px",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: accentColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>C</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#18181b", letterSpacing: "-0.01em" }}>
            Chatty AI
          </span>
        </div>

        {/* Section label */}
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a1a1aa",
            padding: "8px 8px 4px",
          }}
        >
          Command Center
        </div>

        {NAV_ITEMS.slice(0, 2).map((item) => (
          <div
            key={item.label}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: item.active ? 600 : 500,
              color: item.active ? accentColor : "#71717a",
              background: item.active ? GREEN_TINT : "transparent",
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </div>
        ))}

        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a1a1aa",
            padding: "10px 8px 4px",
          }}
        >
          Deliverables
        </div>

        {NAV_ITEMS.slice(2, 7).map((item) => (
          <div
            key={item.label}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              color: "#71717a",
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </div>
        ))}

        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a1a1aa",
            padding: "10px 8px 4px",
          }}
        >
          System
        </div>

        {NAV_ITEMS.slice(7).map((item) => (
          <div
            key={item.label}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              color: "#71717a",
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* ---- Main content ---- */}
      <div
        style={{
          flex: 1,
          padding: "16px 20px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Header */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#a1a1aa",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: accentColor,
                display: "inline-block",
              }}
            />
            Command Center
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#18181b",
              letterSpacing: "-0.02em",
              marginTop: 2,
            }}
          >
            Today
          </div>
        </div>

        {/* Revenue hero card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e4e4e7",
            borderLeft: `3px solid ${accentColor}`,
            borderRadius: 8,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: GREEN_TINT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 16, color: accentColor, fontWeight: 800 }}>$</span>
            </div>
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: GREEN_DARK,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Revenue Generated
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: "#18181b",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  marginTop: 2,
                }}
              >
                $48,200
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              background: GREEN_TINT,
              color: GREEN_DARK,
              padding: "3px 8px",
              borderRadius: 99,
            }}
          >
            +15% ↑
          </span>
        </div>

        {/* Seller cards */}
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#a1a1aa",
              marginBottom: 6,
            }}
          >
            What Chatty Did Today
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {SELLERS.map((s) => (
              <div
                key={s.agent}
                style={{
                  flex: 1,
                  background: "#fff",
                  border: "1px solid #e4e4e7",
                  borderRadius: 8,
                  padding: "8px 8px 6px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: s.bg,
                    marginBottom: 6,
                  }}
                />
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: "#a1a1aa",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.agent}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#18181b",
                    lineHeight: 1,
                    marginTop: 2,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    color: "#71717a",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality strip */}
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#a1a1aa",
              marginBottom: 6,
            }}
          >
            Agent Quality
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {QUALITY.map((q) => (
              <div
                key={q.label}
                style={{
                  flex: 1,
                  background: "#fff",
                  border: "1px solid #e4e4e7",
                  borderRadius: 8,
                  padding: "8px 8px 6px",
                }}
              >
                <div
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#a1a1aa",
                  }}
                >
                  {q.label}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#18181b",
                    lineHeight: 1,
                    marginTop: 3,
                  }}
                >
                  {q.value}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    fontWeight: 600,
                    color: accentColor,
                    marginTop: 2,
                  }}
                >
                  {q.delta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main composition                                                    */
/* ------------------------------------------------------------------ */

export function HeroDeviceAssemble({
  assembleStart = 0,
  device = "laptop",
  accentColor = "#0F8A4F",
  speed = 1,
  className,
}: HeroDeviceAssembleProps) {
  const frame = useCurrentFrame() * speed;
  const { fps } = useVideoConfig();

  const assemble = spring({
    frame: frame - assembleStart,
    fps,
    config: { mass: 1.4, damping: 12, stiffness: 90 },
    durationInFrames: 60,
  });

  // Layer translateZ values from far -> 0
  const lidZ = interpolate(assemble, [0, 1], [1000, 0]);
  const baseZ = interpolate(assemble, [0, 1], [-800, 0]);
  const bezelZ = interpolate(assemble, [0, 1], [600, 0]);
  const screenZ = interpolate(assemble, [0, 1], [300, 0]);

  // Parent rotation easing to 0
  const rotX = interpolate(assemble, [0, 1], [-22, 0]);
  const rotY = interpolate(assemble, [0, 1], [28, 0]);

  // Layer opacity fade in slightly during assembly
  const layerOpacity = interpolate(assemble, [0, 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Settle frame: after assemble ~ 0.95
  const settleFrame = assembleStart + 45;
  const screenWake = interpolate(
    frame,
    [settleFrame, settleFrame + 18],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Shimmer sweep across screen (after wake)
  const shimmerProgress = interpolate(
    frame,
    [settleFrame + 6, settleFrame + 30],
    [-1, 2],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const isPhone = device === "phone";

  // Device dimensions (full size — scaled down 50% via transform)
  const deviceW = isPhone ? 320 : 760;
  const deviceH = isPhone ? 640 : 470;
  const screenInset = isPhone ? 12 : 18;
  const bezelRadius = isPhone ? 36 : 14;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at center, #1a1a22 0%, #050507 70%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 2000,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          position: "relative",
          width: deviceW,
          height: deviceH,
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(0.5)`,
          willChange: "transform",
        }}
      >
        {/* Back lid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateZ(${lidZ - 8}px)`,
            background: "linear-gradient(180deg, #1f2128 0%, #0e1014 100%)",
            borderRadius: bezelRadius + 4,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "0 60px 120px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
            opacity: layerOpacity,
          }}
        />

        {/* Keyboard / chassis base — laptop only */}
        {!isPhone && (
          <div
            style={{
              position: "absolute",
              left: -40,
              right: -40,
              bottom: -28,
              height: 28,
              transform: `translateZ(${baseZ}px) rotateX(78deg)`,
              transformOrigin: "top center",
              background: "linear-gradient(180deg, #2a2d36 0%, #14161c 100%)",
              borderRadius: "0 0 12px 12px",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
              opacity: layerOpacity,
            }}
          />
        )}

        {/* Bezel frame */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateZ(${bezelZ}px)`,
            background: "#0a0a0d",
            borderRadius: bezelRadius,
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow:
              "inset 0 0 0 2px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.5)",
            opacity: layerOpacity,
          }}
        />

        {/* UI screen */}
        <div
          style={{
            position: "absolute",
            inset: screenInset,
            transform: `translateZ(${screenZ}px)`,
            borderRadius: bezelRadius - 6,
            overflow: "hidden",
            background: "black",
            opacity: layerOpacity,
          }}
        >
          {/* Black panel during flight */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#000",
              opacity: 1 - screenWake,
            }}
          />
          {/* UI fades in */}
          <div style={{ position: "absolute", inset: 0, opacity: screenWake }}>
            <MockUI accentColor={accentColor} />
          </div>
          {/* Shimmer sweep */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)`,
              transform: `translateX(${shimmerProgress * 100}%)`,
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
