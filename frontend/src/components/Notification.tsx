"use client"
import { useAppSelector } from '@/hooks/reduxHooks';
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const Notification = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [data, setData] = useState<{ topic: string, info: string }[] | null>(null);
    const {user}=useAppSelector(state=>state.auth)
    useEffect(() => {
        const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`);
        setSocket(socket);
        return () => { socket.disconnect() };
    }, []);

    useEffect(() => {
        if (socket && user) {
            socket.emit("joinNotifications",(user._id));
            socket.on("getNotification", (data) => {
                setData(prev => prev ? [...prev, data] : [data]);
            })
        }
    }, [socket,user])
    return (
        <>
            {data &&
                data.map((item, idx) => {
                    <div key={idx} className='_border flex flex-col bg-white gap-4 rounded-[10px]  max-w-[400px] w-full p-3 fixed z-10 top-10 left-1/2 -translate-x-1/2'>
                        <p className='text-lg leading-7 font-semibold'><span className='text-xl'>{item.topic == "water" ? "💧" : item.topic == "sport" ? "💪" : "🍇"}</span> Hi guys</p>
                        <button className='button-green w-fit ml-auto'>
                            OK
                        </button>
                    </div>
                })
            }
        </>

    )
}

export default Notification