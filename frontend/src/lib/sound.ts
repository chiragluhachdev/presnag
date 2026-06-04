export function playOrderChime() {
  try {
    const audio = new Audio("/NewOrder.mp3");
    audio.play().catch((err) => {
      console.warn("Order sound playback was blocked or failed:", err);
    });
  } catch (err) {
    console.error("Failed to initialize order sound Audio:", err);
  }
}

export function playClickSound() {
  try {
    const audio = new Audio("/click.mp3");
    audio.play().catch((err) => {
      console.warn("Click sound playback was blocked or failed:", err);
    });
  } catch (err) {
    console.error("Failed to initialize click sound Audio:", err);
  }
}

// Ask once for OS notification permission (used for background alerts).
export function ensureNotificationPermission() {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "default") Notification.requestPermission().catch(() => {});
}

export function notify(title: string, body: string) {
  try {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/PreSnaglogo.png" });
    }
  } catch {
    /* ignore */
  }
}
