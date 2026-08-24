"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Droplets, Dumbbell, Ruler, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { api } from "@/api/axiosInstance";
import { Button } from "@/components/ui/Button";
import { useAppSelector } from "@/hooks/reduxHooks";

type AppNotification = { topic: string; _id: string; info: string };

const topicIcons = { water: Droplets, sport: Dumbbell, measurement: Ruler };

export default function Notification() {
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?._id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery<AppNotification[]>({
    queryKey: ["notifications", userId],
    queryFn: ({ signal }) => api.get("/api/notification/notifications", { signal }).then((response) => response.data),
    enabled: Boolean(user?._id),
    retry: 0,
  });

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || !userId) return;
    let cancelled = false;
    let socket: ReturnType<typeof io> | undefined;
    const receive = ({ data }: { data: AppNotification }) => queryClient.setQueryData<AppNotification[]>(["notifications", userId], (current = []) => [...current, data]);

    // the socket connects directly to the backend origin, bypassing the
    // same-origin proxy the httpOnly auth cookie is scoped to — so the token
    // for this handshake has to be fetched over the (proxied) REST API instead.
    // It's valid for as long as the access-token cookie is, which bounds how
    // long a reconnect can go before needing a fresh one.
    void api.get("/api/auth/socket-token").then(({ data }) => {
      if (cancelled) return;
      socket = io(apiUrl, { auth: { token: data.token } });
      socket.on("getNotifications", receive);
    }).catch(() => undefined);

    return () => {
      cancelled = true;
      socket?.off("getNotifications", receive);
      socket?.disconnect();
    };
  }, [queryClient, userId]);

  const dismiss = async (notification: AppNotification, openProfile = false) => {
    queryClient.setQueryData<AppNotification[]>(["notifications", userId], (current = []) => current.filter((item) => item._id !== notification._id));
    try { await api.delete(`/api/notification/notifications/${notification._id}`); }
    catch { void queryClient.invalidateQueries({ queryKey: ["notifications", userId] }); }
    if (openProfile) router.push("/profile");
  };

  if (!notifications.length) return null;

  return (
    <aside aria-label="Notifications" className="fixed inset-x-3 top-3 z-[70] flex flex-col gap-2 sm:left-auto sm:right-4 sm:w-96">
      {notifications.map((notification) => {
        const TopicIcon = topicIcons[notification.topic as keyof typeof topicIcons] ?? Bell;
        return (
          <div key={notification._id} role="status" className="rounded-card border border-border bg-surface p-4 shadow-lg">
            <div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong"><TopicIcon size={17} /></span><p className="min-w-0 flex-1 text-sm leading-6 text-strong">{notification.info}</p><button type="button" aria-label="Dismiss notification" className="flex size-9 shrink-0 items-center justify-center rounded-control text-muted hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus" onClick={() => void dismiss(notification)}><X size={17} /></button></div>
            {notification.topic === "measurement" ? <div className="mt-3 flex justify-end"><Button size="sm" onClick={() => void dismiss(notification, true)}>Review profile</Button></div> : null}
          </div>
        );
      })}
    </aside>
  );
}
