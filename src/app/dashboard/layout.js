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
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        background: "var(--bg)",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          borderRight: "1px solid var(--border)",
          background: "var(--surface)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div
          className="mac-traffic"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <span className="dot-red" />
          <span className="dot-yellow" />
          <span className="dot-green" />
          <div
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--ink-soft)",
              marginRight: 48,
            }}
          >
            chatty.ai
          </div>
        </div>

        <div style={{ padding: "22px 20px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--green)",
                color: "var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 18,
                fontFamily: "Playfair Display, Georgia, serif",
              }}
            >
              C
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  Harbor Dental
                </div>
                {admin ? (
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 700,
                      background: "var(--gold)",
                      color: "var(--green-deep)",
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
                  color: "var(--ink-soft)",
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

        <nav
          style={{
            flex: 1,
            padding: "14px 12px",
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
                  color: active ? "var(--green)" : "var(--ink-soft)",
                  background: active ? "var(--surface-2)" : "transparent",
                  transition: "background .15s",
                }}
              >
                <span
                  style={{
                    width: 22,
                    display: "inline-flex",
                    justifyContent: "center",
                    color: active ? "var(--gold)" : "var(--ink-soft)",
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            padding: 16,
            borderTop: "1px solid var(--border)",
            fontSize: 12,
            color: "var(--ink-soft)",
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--ink)" }}>
            Inbound Plan · $97/mo
          </div>
          <Link
            href="/dashboard/billing"
            style={{ color: "var(--green)", fontWeight: 600 }}
          >
            Upgrade →
          </Link>
          {admin ? (
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                display: "block",
                marginTop: 12,
                width: "100%",
                padding: "8px 12px",
                background: "var(--surface-2)",
                color: "var(--ink)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              Sign Out (Admin)
            </button>
          ) : null}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ padding: "36px 44px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
