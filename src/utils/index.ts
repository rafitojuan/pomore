export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return defaultValue;
  }
};

export const exportToTxt = (data: any[], filename: string): void => {
  const content = data
    .map((item) => {
      if (typeof item === "object") {
        return Object.entries(item)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n");
      }
      return item.toString();
    })
    .join("\n\n");

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const playNotificationSound = (soundUrl?: string): void => {
  try {
    const audio = new Audio(soundUrl || "/amongus.mp3");
    audio.play().catch((error) => {
      console.error("Error playing notification sound:", error);
    });
  } catch (error) {
    console.error("Error creating audio:", error);
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const showNotification = (
  title: string,
  options?: NotificationOptions
): void => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/favicon.ico",
      ...options,
    });
  }
};

export const calculateProgress = (
  timeLeft: number,
  totalTime: number
): number => {
  return ((totalTime - timeLeft) / totalTime) * 100;
};

export const getSessionColor = (sessionType: string): string => {
  switch (sessionType) {
    case "work":
      return "#7C3AED";
    case "short-break":
      return "#10B981";
    case "long-break":
      return "#F59E0B";
    default:
      return "#7C3AED";
  }
};
