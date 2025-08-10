"use client"
import { useAppSelector } from '@/hooks/reduxHooks';
import { ArrowUp, Goal } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

const data = [
    { month: "Jan", weight: 100 },
    { month: "Feb", weight: 96 },
    { month: "Mar", weight: 90 },
    { month: "Apr", weight: 85 },
    { month: "May", weight: 79 },
    { month: "Jun", weight: 75 },
];

const page = () => {
    const { user } = useAppSelector(state => state.auth);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    useEffect(() => {
        if (user) {
            setIsLoading(false);
        }
    }, [user])
    return (
        !isLoading  &&
        <div className='flex flex-col gap-6'>
            <h1 className='page-title '>Dashboard Overview</h1>
            <div className=" _dashboard-banner py-1 px-8  h-60 flex items-center justify-between  ">
                <div className="flex flex-col gap-6 max-w-[590px]">
                    <h2 className='banner-title'>Welcome back, {user?.fullName}</h2>
                    <p className='text-lg leading-7 text-[#19191FFF]'>Stay consistent and trust the process. Every step counts towards your goals!</p>
                </div>
                <Image className='rounded-lg _border' src={"/dashboard/dashboardBanner.jpg"} width={300} height={180} alt='dashboard image' />

            </div>
            <div className="flex flex-col gap-4 ">
                <h2 className='section-title'>Your Key Metrics</h2>
                <div className="grid grid-cols-4 gap-6">
                    <div className="shadow-xs p-6 pt-7 bg-white rounded-[10px] ">
                        <div className="flex items-center justify-between mb-4 text-neutral-600">
                            <span className='text-sm leading-5 font-medium '>Daily Calorie Goal</span>
                            <Goal size={20} />
                        </div>
                        <div className="text-3xl leading-9 font-bold text-neutral-900 mb-1.5">1850 / 2200 kcal</div>
                        <span className='text-sm leading-5 text-neutral-900 flex items-center gap-1'><ArrowUp size={14} /> 75% complete</span>
                    </div>
                    <div className="shadow-xs p-6 pt-7 bg-white rounded-[10px] ">
                        <div className="flex items-center justify-between mb-4 text-neutral-600">
                            <span className='text-sm leading-5 font-medium '>Daily Calorie Goal</span>
                            <Goal size={20} />
                        </div>
                        <div className="text-3xl leading-9 font-bold text-neutral-900 mb-1.5">1850 / 2200 kcal</div>
                        <span className='text-sm leading-5 text-neutral-900 flex items-center gap-1'><ArrowUp size={14} /> 75% complete</span>
                    </div>
                    <div className="shadow-xs p-6 pt-7 bg-white rounded-[10px] ">
                        <div className="flex items-center justify-between mb-4 text-neutral-600">
                            <span className='text-sm leading-5 font-medium '>Daily Calorie Goal</span>
                            <Goal size={20} />
                        </div>
                        <div className="text-3xl leading-9 font-bold text-neutral-900 mb-1.5">1850 / 2200 kcal</div>
                        <span className='text-sm leading-5 text-neutral-900 flex items-center gap-1'><ArrowUp size={14} /> 75% complete</span>
                    </div>
                    <div className="shadow-xs p-6 pt-7 bg-white rounded-[10px] ">
                        <div className="flex items-center justify-between mb-4 text-neutral-600">
                            <span className='text-sm leading-5 font-medium '>Daily Calorie Goal</span>
                            <Goal size={20} />
                        </div>
                        <div className="text-3xl leading-9 font-bold text-neutral-900 mb-1.5">1850 / 2200 kcal</div>
                        <span className='text-sm leading-5 text-neutral-900 flex items-center gap-1'><ArrowUp size={14} /> 75% complete</span>
                    </div>
                </div>

            </div>
            {/* chart using recharts */}
            <div className="flex flex-col gap-4">
                <h2 className='section-title'>Progress Overview</h2>

                <div className="rounded-[10px] bg-white p-6 shadow-xs">
                    <div className="mb-6 flex flex-col gap-1.5">
                        <h2 className="text-xl font-semibold leading-7 ">Weight Trend (Last 6 Months)</h2>
                        <p className="text-sm leading-5 text-neutral-600 ">Your progress at a glance.</p>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={data}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="#22c55e"
                                dot={{ stroke: "#22c55e", strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="flex flex-col gap-4 ">
                <h2 className='section-title'>Quick Summaries</h2>
                <div className="grid grid-cols-3 gap-6">
                    <div className="_border rounded-[10px] p-6 pt-[25px] max-w-[358px] flex flex-col bg-white">
                        <div className="flex flex-col mb-6 gap-1.5">
                            <h3 className='text-xl leading-7 font-semibold  text-neutral-900'>Today's Workout Plan</h3>
                            <p className='text-neutral-600 text-sm leading-5'>Daily Cardio Blast: 30 mins running, 15 mins cycling.</p>
                        </div>
                        <div className="flex flex-col justify-between grow-1">
                            <Image className='rounded-lg ' src={"/dashboard/workout.jpg"} width={310} height={174} alt='workout image' />
                            <Link href={`/workout-plan/${new Date().getDate()}`} className='mt-4 button-green'>View Workout</Link>
                        </div>
                    </div>
                    <div className="_border rounded-[10px] p-6 pt-[25px] max-w-[358px] flex flex-col bg-white">
                        <div className="flex flex-col mb-6 gap-1.5">
                            <h3 className='text-xl leading-7 font-semibold  text-neutral-900'>Your Nutrition Summary</h3>
                            <p className='text-neutral-600 text-sm leading-5'>Remaining: 350 kcal. Focus on protein and vegetables.</p>
                        </div>
                        <div className="flex flex-col justify-between grow-1">

                            <Image className='rounded-lg ' src={"/dashboard/nutrition.jpg"} width={310} height={174} alt='food image' />
                            <Link href={`/nutrition-plan`} className='mt-4 button-green'>View Workout</Link>
                        </div>
                    </div>
                    <div className="_border rounded-[10px] p-6 pt-[25px] max-w-[358px] flex flex-col bg-white">
                        <div className="flex flex-col mb-6 gap-1.5">
                            <h3 className='text-xl leading-7 font-semibold  text-neutral-900'>Recent Photo Analysis</h3>
                            <p className='text-neutral-600 text-sm leading-5'>Daily Cardio Blast: 30 mins running, 15 mins cycling.</p>
                        </div>
                        <div className="flex flex-col justify-between grow-1">
                            <Image className='rounded-lg' src={"/dashboard/analysis.jpg"} width={310} height={174} alt='ai brains image' />
                            <Link href={`/ai-analysis`} className='mt-4 button-green'>View Workout</Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default page