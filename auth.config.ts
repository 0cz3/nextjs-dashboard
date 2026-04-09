import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
// サインイン時に用意したログインページを用いる
  pages: {
    signIn: '/login',
  },
    callbacks: {
		// リクエストページ表示前、認可の確認
    authorized({ auth, request: { nextUrl } }) {
		// auth?.userの二重否定。真偽値に直すため
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
// 型指定部分
} satisfies NextAuthConfig;