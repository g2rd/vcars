import { describe, expect, it } from "vitest";
import { isProtectedAdminPath } from "./admin-paths";

describe("isProtectedAdminPath", () => {
  it("chroni strony i akcje panelu", () => {
    for (const path of ["/admin", "/admin/flota", "/admin/flota/nowe", "/admin/zapytania", "/admin/konto"]) {
      expect(isProtectedAdminPath(path), path).toBe(true);
    }
  });

  it("zostawia otwarte logowanie, tryb offline, manifest, service worker i ikony", () => {
    for (const path of [
      "/admin/login",
      "/admin/offline",
      "/admin/manifest.webmanifest",
      "/admin/sw.js",
      "/admin/icon-192.png",
      "/admin/icon-maskable-512.png",
    ]) {
      expect(isProtectedAdminPath(path), path).toBe(false);
    }
  });

  it("nie dotyczy stron publicznych ani podobnych prefiksów", () => {
    for (const path of ["/", "/flota", "/administracja", "/media/vehicles/a.jpg"]) {
      expect(isProtectedAdminPath(path), path).toBe(false);
    }
  });

  it("nie daje się obejść ścieżkami udającymi pliki publiczne", () => {
    expect(isProtectedAdminPath("/admin/login/../flota")).toBe(true);
    expect(isProtectedAdminPath("/admin/icon-192.png/../../konto")).toBe(true);
    expect(isProtectedAdminPath("/admin/flota/icon-192.png")).toBe(true);
  });
});
