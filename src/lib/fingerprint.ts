// lib/fingerprint.ts
export class BrowserFingerprint {
  private static instance: BrowserFingerprint;
  private fingerprint: string | null = null;

  private constructor() {}

  public static getInstance(): BrowserFingerprint {
    if (!BrowserFingerprint.instance) {
      BrowserFingerprint.instance = new BrowserFingerprint();
    }
    return BrowserFingerprint.instance;
  }

  private async generateCanvasFingerprint(): Promise<string> {
    return new Promise((resolve) => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve("no-canvas");

        canvas.width = 200;
        canvas.height = 50;

        // Draw some text and shapes for fingerprinting
        ctx.textBaseline = "top";
        ctx.font = "14px Arial";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("Fingerprint test 🎨", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("Fingerprint test 🎨", 4, 17);

        resolve(canvas.toDataURL());
      } catch (e) {
        resolve("canvas-error");
      }
    });
  }

  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "no-webgl";

      const debugInfo =
        "getExtension" in gl
          ? gl.getExtension("WEBGL_debug_renderer_info")
          : undefined;
      if (!debugInfo) return "no-debug-info";

      const vendor =
        "getParameter" in gl
          ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "unknown-vendor"
          : "unknown-vendor";
      const renderer =
        "getParameter" in gl
          ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ||
            "unknown-renderer"
          : "unknown-renderer";

      return `${vendor}~${renderer}`;
    } catch (e) {
      return "webgl-error";
    }
  }

  private async hashString(str: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      // Fallback if crypto.subtle is not available
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash).toString(16);
    }
  }

  public async generateFingerprint(): Promise<string> {
    if (this.fingerprint) {
      return this.fingerprint;
    }

    // console.log("🔍 Starting fingerprint generation...");

    try {
      // Collect browser and system information
      const screen = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;
      const platform = navigator.platform;
      const userAgent = navigator.userAgent;
      const cookieEnabled = navigator.cookieEnabled;
      const doNotTrack = navigator.doNotTrack || "null";
      const hardwareConcurrency = navigator.hardwareConcurrency || 0;
      const deviceMemory = (navigator as any).deviceMemory || 0;

      // Get available fonts (simple detection)
      const fontList = [
        "Arial",
        "Helvetica",
        "Times",
        "Courier",
        "Verdana",
        "Georgia",
        "Palatino",
        "Garamond",
        "Comic Sans MS",
        "Trebuchet MS",
        "Arial Black",
        "Impact",
      ];
      const availableFonts = fontList
        .filter((font) => {
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return false;

            ctx.font = `12px ${font}, monospace`;
            const width1 = ctx.measureText("mmmmmmm").width;

            ctx.font = "12px monospace";
            const width2 = ctx.measureText("mmmmmmm").width;

            return width1 !== width2;
          } catch (e) {
            return false;
          }
        })
        .join(",");

      // Get plugins info
      const plugins = Array.from(navigator.plugins)
        .map((plugin) => plugin.name)
        .sort()
        .join(",");

      // Get canvas fingerprint
      const canvasFingerprint = await this.generateCanvasFingerprint();

      // Get WebGL fingerprint
      const webglFingerprint = this.getWebGLFingerprint();
      // console.log("🎮 WebGL fingerprint:", webglFingerprint);

      // Combine all data
      const fingerprintData = [
        screen,
        timezone,
        language,
        platform,
        userAgent,
        cookieEnabled.toString(),
        doNotTrack,
        hardwareConcurrency.toString(),
        deviceMemory.toString(),
        availableFonts,
        plugins,
        canvasFingerprint,
        webglFingerprint,
      ].join("|");

      // Hash the combined data
      this.fingerprint = await this.hashString(fingerprintData);

      return this.fingerprint;
    } catch (error) {
      // Fallback to a simpler fingerprint
      const fallbackData = `${navigator.userAgent}|${screen.width}x${screen.height}|${navigator.language}`;
      this.fingerprint = await this.hashString(fallbackData);

      return this.fingerprint;
    }
  }

  public clearFingerprint(): void {
    this.fingerprint = null;
    console.log("🗑️ Fingerprint cleared");
  }

  public async getStoredFingerprint(): Promise<string | null> {
    return this.fingerprint;
  }
}
