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
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: notifications = [] } = useQuery<AppNotification[]>({
    queryKey: ["notifications"],
    queryFn: () => api.get("/api/notification/notifications").then((response) => response.data),
    retry: 0,
  });

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || !user) return;
    const socket = io(apiUrl);
    socket.emit("joinNotifications", user._id);
    const receive = ({ data }: { data: AppNotification }) => queryClient.setQueryData<AppNotification[]>(["notifications"], (current = []) => [...current, data]);
    socket.on("getNotifications", receive);
    return () => { socket.off("getNotifications", receive); socket.disconnect(); };
  }, [queryClient, user]);

  const dismiss = async (notification: AppNotification, openProfile = false) => {
    queryClient.setQueryData<AppNotification[]>(["notifications"], (current = []) => current.filter((item) => item._id !== notification._id));
    try { await api.delete(`/api/notification/notifications/${notification._id}`); }
    catch { void queryClient.invalidateQueries({ queryKey: ["notifications"] }); }
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
