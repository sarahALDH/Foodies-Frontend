import api from "./api";

export interface Notification {
  id?: string;
  _id?: string;
  user_id: string;
  type: "rating" | "comment" | "like" | "recipe" | "follow";
  title: string;
  message: string;
  recipe_id?: string;
  read?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface NotificationQueryParams {
  user_id?: string;
  read?: boolean;
  type?: string;
}

// Get all notifications (supports query params)
export const getNotifications = async (
  params?: NotificationQueryParams
): Promise<Notification[]> => {
  const response = await api.get<any>("/api/notifications", { params });

  // Handle different response structures
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  } else if (data?.data && Array.isArray(data.data)) {
    return data.data;
  } else if (data?.notifications && Array.isArray(data.notifications)) {
    return data.notifications;
  } else {
    console.warn("Unexpected notifications response structure:", data);
    return [];
  }
};

// Get notification by ID
export const getNotificationById = async (
  id: string
): Promise<Notification> => {
  const response = await api.get<any>(`/api/notifications/${id}`);

  // Handle different response structures
  const data = response.data;

  // If response has a nested data property, use it
  if (
    data?.data &&
    typeof data.data === "object" &&
    !Array.isArray(data.data)
  ) {
    return data.data;
  }

  // Otherwise return the data directly
  return data;
};

// Create notification
export const createNotification = async (
  data: Partial<Notification>
): Promise<Notification> => {
  const response = await api.post<Notification>("/api/notifications", data);
  return response.data;
};

// Update notification
export const updateNotification = async (
  id: string,
  data: Partial<Notification>
): Promise<Notification> => {
  const response = await api.put<Notification>(
    `/api/notifications/${id}`,
    data
  );
  return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (
  id: string
): Promise<Notification> => {
  return await updateNotification(id, { read: true });
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<void> => {
  try {
    const notifications = await getNotifications({
      user_id: userId,
      read: false,
    });
    await Promise.all(
      notifications.map((notification) => {
        const notificationId = notification.id || notification._id;
        if (notificationId) {
          return markNotificationAsRead(notificationId);
        }
      })
    );
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/api/notifications/${id}`);
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (
  userId: string
): Promise<number> => {
  try {
    const notifications = await getNotifications({
      user_id: userId,
      read: false,
    });
    return notifications.length;
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    return 0;
  }
};
