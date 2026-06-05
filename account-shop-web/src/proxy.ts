import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isCustomerRoute = ['/dashboard', '/orders', '/profile', '/tickets', '/deposit'].some(route => pathname.startsWith(route));

  if (!isAdminRoute && !isCustomerRoute) {
    return NextResponse.next();
  }

  // Nếu không có token -> Về trang đăng nhập
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Phân tích token để lấy role (Cách giải mã Base64 payload tương thích Edge Runtime)
  let role = '';
  try {
    const payloadBase64 = token.split('.')[1];
    // Thay thế các ký tự Base64Url sang Base64 chuẩn
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsedPayload = JSON.parse(jsonPayload);
    role = parsedPayload.role || '';
  } catch (error) {
    console.error("Invalid token in middleware", error);
    // Lỗi parse token -> Token không hợp lệ
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const userRole = role.startsWith('ROLE_') ? role : `ROLE_${role.toUpperCase()}`;

  // Kiểm tra quyền truy cập Admin
  if (isAdminRoute && userRole !== 'ROLE_ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/tickets/:path*',
    '/deposit/:path*'
  ],
};
