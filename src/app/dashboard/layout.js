'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAdminSession, clearAdminSession } from "@/lib/admin";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "◈" },
  { href: "/dashboard/inbound", label: "Inbound Calls", icon: "↙" },
  { href: "/dashboard/outbound", label: "Outbound Calls", icon: "↗" },
  { href: "/dashboard/appointments", label: "Appointments", icon: "◉" },
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
      className="mesh-bg"
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          borderRight: "1px solid var(--dark-border)",
          background: "#070b09",
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
            borderBottom: "1px solid var(--dark-border)",
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
                  "linear-gradient(135deg, var(--emerald), var(--emerald-mid))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--dark-border)",
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
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--text-bright)",
                  }}
                >
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
                      background: "rgba(52,211,153,0.1)",
                      color: "var(--emerald-bright)",
                      border: "1px solid rgba(52,211,153,0.25)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    ADMIN
                  </span>
                ) : null}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
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
                : pathname.startsWith(item.href);
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
                    ? "rgba(52,211,153,0.06)"
                    : "transparent",
                  borderLeft: active
                    ? "2px solid var(--emerald-bright)"
                    : "2px solid transparent",
                  transition: "all .15s",
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
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom plan + sign-out */}
        <div
          style={{
            padding: 16,
            borderTop: "1px solid var(--dark-border)",
            fontSize: 12,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: "var(--text-bright)",
            }}
          >
            Inbound Plan · $97/mo
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
            <button
              type="button"
              onClick={handleSignOut}
              className="cta-ghost"
              style={{
                display: "block",
                marginTop: 12,
                width: "100%",
                padding: "8px 12px",
                fontSize: 12,
                justifyContent: "center",
              }}
            >
              Sign Out (Admin)
            </button>
          ) : null}
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          padding: "40px 44px",
          overflowY: "auto",
          color: "var(--text-bright)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
