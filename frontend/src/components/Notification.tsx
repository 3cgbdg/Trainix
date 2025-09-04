"use client"
import { api } from '@/api/axiosInstance';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const Notification = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<{ topic: string, _id: string, info: string }[] | null>(null);
    const { user } = useAppSelector(state => state.auth)
    const router = useRouter();
    // joining room and listening to notif's
    useEffect(() => {
        if (socket && user) {
            socket.emit("joinNotifications", (user._id));
            socket.on("getNotifications", ({ data }) => {
                setNotifications(prev => prev ? [...prev, data] : [data]);
            })
        }
    }, [socket, user])

    // using simple interceptor (Without tanstack!)
    const deleteItem = async (id: string) => {
        try {
            setNotifications(prev => prev ? prev?.filter(item => item._id !== id) : null)
            await api.delete(`/api/notification/notifications/${id}`);

        } catch (err) {
            console.error(err);
        }
    }

    // get request async func
    const getDataFunc = async () => {
        const res = await api.get("/api/notification/notifications");
        return res.data;
    }
    const { data, isSuccess } = useQuery({
        queryKey: ["notifications"],
        queryFn: getDataFunc,


    })

    // connecting to io server
    useEffect(() => {
        const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`);
        setSocket(socket);
        return () => { socket.disconnect() };
    }, []);

    // getting data ( available notifications ) after render 
    useEffect(() => {
        if (isSuccess)
            setNotifications(data)
    }, [isSuccess])

    return (
        <>
            {notifications &&
                notifications.map((item, idx) => {
                    return <div key={idx} className={`mt-${idx * 1}  _border flex flex-col bg-white gap-4 rounded-[10px] fixed z-10 top-8 right-8 w-[320px] p-3`}>
                        <p className='text-lg leading-7 font-semibold'>{item.info}  <span className='text-xl'>{item.topic == "water" ? "💧" : item.topic == "sport" ? "💪" : item.topic == "measurement" ? "📏" : "🍇"}</span></p>
                        <div className="flex justify-end items-center gap-4">
                            {item.topic == "measurement" &&
                                <button onClick={async () => { await deleteItem(item._id); router.push("/profile") }} className='button-green w-fit ml-auto'>
                                    Go to profile
                                </button>
                            }
                            <button onClick={async () => { await deleteItem(item._id) }} className='button-green w-fit '>
                                OK
                            </button>
                        </div>
                    </div>
                })
            }
        </>

    )
}

export default Notification