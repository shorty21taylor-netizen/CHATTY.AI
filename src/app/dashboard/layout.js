'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bot, Users, Crosshair, MessageSquare } from "lucide-react";
import { getAdminSession, clearAdminSession } from "@/lib/admin";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "◈" },
  { href: "/dashboard/brief", label: "Mission Control", lucide: Crosshair, pulse: true },
  { href: "/dashboard/feedback", label: "Feedback", lucide: MessageSquare },
  { href: "/dashboard/crm", label: "CRM", lucide: Users },
  { href: "/dashboard/agents", label: "Agents", lucide: Bot, pulse: true },
  { href: "/dashboard/inbound", label: "Inbound Calls", icon: "↙" },
  { href: "/dashboard/outbound", label: "Outbound Calls", icon: "↗" },
  { href: "/dashboard/appointments", label: "Appointments", icon: "◉" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "▥" },
  { href: "/dashboard/agent", label: "Agent Settings", icon: "✦" },
  { href: "/dashboard/telegram", label: "Telegram EA", icon: "✉" },
  { href: "/dashboard/billing", label: "Billing", icon: "$" },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    setAdmin(getAdminSession());
  }, []);

  function handleSignOut() {
    clearAdminSession();
    setAdmin(null);
    router.push("/");
  }

  return (
    <div
      className="app-bg"
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        position: "relative",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          borderRight: "1px solid var(--border)",
          background: "var(--sidebar-bg)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Traffic-light chrome */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#ff5f57",
              display: "inline-block",
            }}
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#febc2e",
              display: "inline-block",
            }}
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#28c840",
              display: "inline-block",
            }}
          />
          <div
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-muted)",
              marginRight: 48,
            }}
          >
            chatty.ai
          </div>
        </div>

        {/* Workspace card */}
        <div style={{ padding: "22px 20px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background:
                  "linear-gradient(135deg, var(--emerald-bright), var(--emerald-hover))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border)",
                position: "relative",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "var(--emerald-bright)",
                  boxShadow: "0 0 12px var(--emerald-glow)",
                  display: "inline-block",
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div className="t-h3">
                  Harbor Dental
                </div>
                {admin ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 9,
                      fontWeight: 700,
                      background: "var(--emerald-bright)",
                      color: "#ffffff",
                      letterSpacing: "0.08em",
                    }}
                  >
                    ADMIN
                  </span>
                ) : null}
              </div>
              <div className="t-body-sm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {admin ? admin.email : "Workspace"}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {NAV.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const LucideIcon = item.lucide;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--text-bright)" : "var(--text-muted)",
                  background: active
                    ? "var(--emerald-tint)"
                    : "transparent",
                  borderLeft: active
                    ? "2px solid var(--emerald-bright)"
                    : "2px solid transparent",
                  transition: "all .15s",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    width: 22,
                    display: "inline-flex",
                    justifyContent: "center",
                    color: active
                      ? "var(--emerald-bright)"
                      : "var(--text-muted)",
                    fontSize: 15,
                  }}
                >
                  {LucideIcon ? <LucideIcon size={15} /> : item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.pulse ? (
                  <span
                    aria-hidden
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--emerald-bright)",
                      boxShadow: "0 0 8px var(--emerald-glow)",
                      animation: "pulse-dot 2s infinite",
                    }}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Bottom plan + sign-out */}
        <div
          style={{
            padding: 16,
            borderTop: "1px solid var(--border)",
          }}
        >
          <div className="t-eyebrow" style={{ marginBottom: 6 }}>Current Plan</div>
          <div className="t-body-sm" style={{ color: "var(--text-bright)", fontWeight: 600 }}>
            Inbound Plan &middot; $97/mo
          </div>
          <Link
            href="/dashboard/billing"
            style={{
              color: "var(--emerald-bright)",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            Upgrade →
          </Link>
          {admin ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full mt-3 justify-center"
            >
              Sign Out (Admin)
            </Button>
          ) : null}
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          padding: "40px 44px",
          overflowY: "auto",
          color: "var(--text-primary)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </main>
    </div>
  );
}
