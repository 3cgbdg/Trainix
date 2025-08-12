"use client"

import { api } from "@/api/axiosInstance"
import { useQuery } from "@tanstack/react-query"
import { Bolt, CalendarDays } from "lucide-react"
import Link from "next/link"




const page = () => {

    const getWorkouts = async()=>{
        const res = await api.get("api/fitness-plan/workouts");
        return res.data;
    }
    
    const {data} = useQuery({
        queryKey:["workouts"],
        queryFn:getWorkouts,
        
        
    })
    console.log(data);
    return (
        <div className='flex flex-col gap-6'>
            <h1 className='page-title '>Workout Plan</h1>
            <div className=" _workout-plan-banner py-1 px-8  h-60 flex items-center  justify-between  ">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4 mb-1">
                        <Bolt size={32} color="white" />
                        <div className="flex flex-col gap-0.5 ">
                            <h2 className='banner-title'>Full Body Strength</h2>
                            <p className='text-lg leading-7 text-[#19191FFF]'>Week 3 - Muscle Gain & Endurance</p>
                        </div>
                    </div>
                    <p className="text-lg leading-7 text-custom-black">Your AI-powered plan is ready to guide you through this week's routines. Stay consistent for optimal results!</p>
                    <Link className="button-green max-w-[182px] w-full" href={"/workout?day=1"}>Start Today's Workout</Link>
                </div>
            </div>


            <div className="flex flex-col gap-4 ">
                <h2 className='section-title'>Weekly Schedule</h2>
                <div className="grid grid-cols-4 gap-6">
                    <div className=" p-4 pt-5.5 bg-white rounded-md ">
                        <div className="flex items-center justify-between mb-8 ">
                            <div className="flex items-center gap-2">
                                <CalendarDays className="text-neutral-600" size={20}/>
                                <span className="text-lg leading-7 font-semibold text-neutral-900">Monday</span>
                            </div>
                            <div className="p-1.5 "></div>
                        </div>
                        <div className="text-3xl leading-9 font-bold text-neutral-900 mb-1.5">1850 / 2200 kcal</div>
                    </div>

                </div>

            </div>


        </div>
    )
}

export default page