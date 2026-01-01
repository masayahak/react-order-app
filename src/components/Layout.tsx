"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Users,
  Package,
  LogOut,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  const isAdmin = session?.user?.role === "Administrator";

  const navLinkClass = (path: string) => {
    const isActive = pathname?.startsWith(path);
    return `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
    }`;
  };

  return (
    <div className="min-h-screen flex">
      {/* サイドバー */}
      <aside className="w-64 border-r bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col fixed h-full">
        {/* ロゴ・タイトル */}
        <div className="px-4 py-5 border-b bg-white/50">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              受注管理
            </h1>
          </Link>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <Link href="/orders" className={navLinkClass("/orders")}>
              <FileText className="w-5 h-5" />
              <span>受注管理</span>
            </Link>

            {isAdmin && (
              <>
                <Separator className="my-4" />
                <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  マスタ管理
                </p>
                <Link href="/customers" className={navLinkClass("/customers")}>
                  <Users className="w-5 h-5" />
                  <span>得意先マスタ</span>
                </Link>
                <Link href="/products" className={navLinkClass("/products")}>
                  <Package className="w-5 h-5" />
                  <span>商品マスタ</span>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* ユーザー情報・ログアウト */}
        <div className="border-t bg-white/50 p-4">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-lg">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {session?.user?.name}
              </p>
              <Badge
                variant={isAdmin ? "default" : "secondary"}
                className={`mt-1 text-xs ${
                  isAdmin
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                    : ""
                }`}
              >
                {isAdmin ? "管理者" : "一般"}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            ログアウト
          </Button>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 ml-64 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
