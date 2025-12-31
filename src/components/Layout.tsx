"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// SVGアイコンコンポーネント
const HomeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

const OrderIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const CustomerIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const ProductIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  const isAdmin = session?.user?.role === "Administrator";

  const navLinkClass = (path: string) => {
    const isActive = pathname?.startsWith(path);
    return `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? "bg-white/10 text-white border-l-4 border-white"
        : "text-gray-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent"
    }`;
  };

  return (
    <div className="min-h-screen flex">
      {/* サイドバー */}
      <aside
        className="w-64 bg-linear-to-b from-slate-800 to-slate-900 flex flex-col fixed h-full"
        style={{ colorScheme: "dark" }}
      >
        {/* ロゴ・タイトル */}
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <HomeIcon />
            </div>
            <h1
              className="text-xl font-bold drop-shadow-sm"
              style={{ color: "#ffffff" }}
            >
              受注管理
            </h1>
          </Link>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 py-4">
          <div className="space-y-1">
            <Link href="/orders" className={navLinkClass("/orders")}>
              <OrderIcon />
              <span>受注管理</span>
            </Link>

            {isAdmin && (
              <>
                <div className="px-4 py-3 mt-4">
                  <hr className="border-white/20" />
                </div>
                <Link href="/customers" className={navLinkClass("/customers")}>
                  <CustomerIcon />
                  <span>得意先マスタ</span>
                </Link>
                <Link href="/products" className={navLinkClass("/products")}>
                  <ProductIcon />
                  <span>商品マスタ</span>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* ユーザー情報・ログアウト */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <span className="text-blue-300 font-medium">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-400">
                {session?.user?.role === "Administrator"
                  ? "管理者"
                  : "一般ユーザー"}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogoutIcon />
            <span>ログアウト</span>
          </button>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 ml-64 bg-gray-100 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
