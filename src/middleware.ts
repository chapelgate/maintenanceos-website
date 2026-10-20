import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale, isValidLocale, getLocaleFromPath, stripLocaleFromPath, prependLocaleToPath } from "@/i18n/config";

const PUBLIC_FILES = /\.(.*)$/;
const LOCALE_PATHS = new RegExp(`^/(${locales.join("|")})(/|$)`);

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (PUBLIC_FILES.test(pathname) || pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  const localeFromPath = getLocaleFromPath(pathname);

  if (localeFromPath) {
    return NextResponse.next();
  }

  const acceptLanguage = request.headers.get("accept-language");
  let detectedLocale: string = defaultLocale;

  if (acceptLanguage) {
    const preferredLocales = acceptLanguage
      .split(",")
      .map((l) => l.split(";")[0].trim().toLowerCase())
      .filter((l) => l);

    for (const pref of preferredLocales) {
      const exactMatch = locales.find((loc) => loc.toLowerCase() === pref);
      if (exactMatch) {
        detectedLocale = exactMatch;
        break;
      }
      const langMatch = locales.find((loc) => loc.toLowerCase().startsWith(pref.split("-")[0]));
      if (langMatch) {
        detectedLocale = langMatch;
        break;
      }
    }
  }

  const newPathname = prependLocaleToPath(pathname, detectedLocale as typeof defaultLocale);
  const newUrl = request.nextUrl.clone();
  newUrl.pathname = newPathname;

  const response = NextResponse.redirect(newUrl);
  response.headers.set("x-middleware-next", "1");

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|\\.well-known|fonts|images).*)",
  ],
};