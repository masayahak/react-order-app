import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import db from './db';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: 'ユーザー名', type: 'text' },
        password: { label: 'パスワード', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.username || !credentials?.password) {
            return null;
          }

          const database = db();
          const user = database
            .prepare('SELECT user_id, username, password_hash, role FROM users WHERE username = ?')
            .get(credentials.username as string) as {
            user_id: number;
            username: string;
            password_hash: string;
            role: string;
          } | undefined;

          if (!user) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password as string, user.password_hash);
          if (!isValid) {
            return null;
          }

          return {
            id: user.user_id.toString(),
            name: user.username,
            role: user.role,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});

