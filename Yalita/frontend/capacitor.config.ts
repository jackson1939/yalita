import { CapacitorConfig } from "@capacitor/cli";

const isDev = process.env.NODE_ENV !== "production";

const config: CapacitorConfig = {
  appId: "com.yalita.app",
  appName: "Yalita",
  webDir: "out", // usado solo para export estático (offline)

  // ── Modo servidor (recomendado para hackathon) ──────────────────────────
  // El APK carga la web desde la URL del servidor.
  // En desarrollo: apunta a tu Next.js local
  // En producción: apunta a tu Vercel deployment
  server: {
    url: isDev
      ? "http://10.0.2.2:3000"   // 10.0.2.2 = localhost desde el emulador Android
      : "https://yalita.vercel.app", // ← cambiar por tu URL real de Vercel
    cleartext: isDev,             // solo permite HTTP en dev
    androidScheme: "https",
  },

  // ── Android config ───────────────────────────────────────────────────────
  android: {
    backgroundColor: "#1E2235",
    allowMixedContent: isDev,
    captureInput: true,
    webContentsDebuggingEnabled: isDev,
    buildOptions: {
      releaseType: "APK",
    },
  },

  // ── Plugins ──────────────────────────────────────────────────────────────
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: "#1E2235",
      androidSplashResourceName: "splash",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    StatusBar: {
      style: "DARK",              // texto blanco sobre fondo navy
      backgroundColor: "#1E2235",
      overlaysWebView: false,
    },
  },
};

export default config;
