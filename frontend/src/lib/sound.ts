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

/* ---------------------------------------------------------------------------
 * Continuous new-order alarm.
 * Loops the order chime until stopped (i.e. until the vendor accepts/declines
 * every pending order). Survives navigation since it lives at module scope.
 * ------------------------------------------------------------------------- */
let alarmAudio: HTMLAudioElement | null = null;
let alarmWanted = false;

function ensureAlarmEl(): HTMLAudioElement {
  if (!alarmAudio) {
    alarmAudio = new Audio("/NewOrder.mp3");
    alarmAudio.loop = true;
  }
  return alarmAudio;
}

/** Start (or keep) the looping alarm. Safe to call repeatedly. */
export function startOrderAlarm() {
  alarmWanted = true;
  const a = ensureAlarmEl();
  // Already ringing — nothing to do.
  if (!a.paused) return;
  a.play().catch(() => {
    // Autoplay blocked until the user interacts; the gesture listener retries.
  });
}

/** Stop the looping alarm. */
export function stopOrderAlarm() {
  alarmWanted = false;
  if (alarmAudio) {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
  }
}

// If the browser blocked autoplay, retry on the first user gesture.
if (typeof window !== "undefined") {
  const retry = () => {
    if (alarmWanted && alarmAudio && alarmAudio.paused) {
      alarmAudio.play().catch(() => {});
    }
  };
  window.addEventListener("pointerdown", retry);
  window.addEventListener("keydown", retry);
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
