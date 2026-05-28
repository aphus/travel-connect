import { fetchWrapper } from "./fetchWrapper";

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  targetUrl: string | null;
  readAt: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
};

type RawNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  targetUrl?: string | null;
  target_url?: string | null;
  readAt?: string | null;
  read_at?: string | null;
  createdAt?: string;
  created_at?: string;
  metadata?: Record<string, unknown> | null;
};

export async function getNotifications() {
  const notifications = await fetchWrapper<RawNotification[]>("/notifications");
  return notifications.map(normalizeNotification);
}

export async function getUnreadNotificationCount() {
  return fetchWrapper<number>("/notifications/unread-count");
}

export async function markNotificationRead(id: string) {
  const notification = await fetchWrapper<RawNotification>(
    `/notifications/${id}/read`,
    { method: "PATCH" },
  );
  return normalizeNotification(notification);
}

export async function markAllNotificationsRead() {
  return fetchWrapper<{ success: boolean }>("/notifications/read-all", {
    method: "PATCH",
  });
}

function normalizeNotification(notification: RawNotification): Notification {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    targetUrl: notification.targetUrl ?? notification.target_url ?? null,
    readAt: notification.readAt ?? notification.read_at ?? null,
    createdAt: notification.createdAt ?? notification.created_at ?? "",
    metadata: notification.metadata ?? null,
  };
}
