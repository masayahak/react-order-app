"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("ユーザー名またはパスワードが正しくありません");
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
    setUsername(testUsername);
    setPassword(testPassword);

    const result = await signIn("credentials", {
      username: testUsername,
      password: testPassword,
      redirect: false,
    });

    if (result?.error) {
      setError("ログインに失敗しました");
    } else {
      const returnUrl = searchParams.get("callbackUrl") || "/orders";
      router.push(returnUrl);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl">
        <div>
          <h2 className="text-center text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            受注管理システム
          </h2>
          <p className="mt-3 text-center text-sm text-gray-600">
            ログインしてください
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                ユーザー名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            >
              ログイン
            </button>
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-3">テストログイン:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTestLogin("admin", "admin123")}
                className="flex-1 py-2 px-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
              >
                管理者でログイン
              </button>
              <button
                type="button"
                onClick={() => handleTestLogin("user", "user123")}
                className="flex-1 py-2 px-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
              >
                一般でログイン
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
