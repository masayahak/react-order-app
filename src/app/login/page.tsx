"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("ユーザー名またはパスワードが正しくありません");
      setLoading(false);
    } else {
      const returnUrl = searchParams.get("callbackUrl") || "/orders";
      router.push(returnUrl);
      router.refresh();
    }
  };

  const handleTestLogin = async (
    testUsername: string,
    testPassword: string
  ) => {
    setError("");
    setLoading(true);
    setUsername(testUsername);
    setPassword(testPassword);

    const result = await signIn("credentials", {
      username: testUsername,
      password: testPassword,
      redirect: false,
    });

    if (result?.error) {
      setError("ログインに失敗しました");
      setLoading(false);
    } else {
      const returnUrl = searchParams.get("callbackUrl") || "/orders";
      router.push(returnUrl);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md border-t-4 border-t-blue-500 shadow-2xl">
        <CardHeader className="space-y-1 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            受注管理システム
          </CardTitle>
          <CardDescription className="text-center text-blue-700">
            ログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">ユーザー名</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md" 
              disabled={loading}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground text-center">
              テストログイン
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleTestLogin("admin", "admin123")}
                disabled={loading}
                className="w-full"
              >
                管理者
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleTestLogin("user", "user123")}
                disabled={loading}
                className="w-full"
              >
                一般ユーザー
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">読み込み中...</div>}>
      <LoginForm />
    </Suspense>
  );
}


