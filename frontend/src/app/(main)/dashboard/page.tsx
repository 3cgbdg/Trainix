"use client"
import { api } from '@/api/axiosInstance';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowUp, Bike, Goal, MonitorOff, Scale } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link';
import { useCallback } from 'react';

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


const page = () => {
    const { user } = useAppSelector(state => state.auth);
    const { nutritionDay } = useAppSelector(state => state.nutritionDay);
    const { workouts } = useAppSelector(state => state.workouts);

    const getNumbers = useCallback(async () => {
        const res = await api.get(`/api/fitness-plan/reports/numbers`, { params: { date: new Date() } });
        return res.data;
    }, [])

    const { data, isLoading } = useQuery({
        queryKey: ["numbers", new Date().toISOString().split('T')[0]],
        queryFn: getNumbers,
    })
    console.log(data);

    return (
        <div className='flex flex-col gap-6'>
            <h1 className='page-title '>Dashboard Overview</h1>
            {user ?
                // banner
                <div className=" _dashboard-banner py-1 px-8  min-h-60  flex items-center gap-2 justify-between  ">
                    <div className="flex flex-col gap-6 max-w-[590px]">
                        <h2 className='banner-title'>Welcome back, {user?.firstName} {user?.lastName}</h2>
                        <p className='text-lg leading-7 text-[#19191FFF]'>Stay consistent and trust the process. Every step counts towards your goals!</p>
                    </div>
                    <Image className='rounded-lg _border lg:block hidden' src={"/dashboard/dashboardBanner.jpg"} width={300} height={180} alt='dashboard image' />

                </div>
                : <div className=" _dashboard-banner py-1 px-8  min-h-60  flex items-center gap-2 justify-between  skeleton"></div>}
            {!isLoading && <>
                {/* metrics banners */}
                <div className="flex flex-col gap-4 ">
                    <h2 className='section-title'>Your Key Metrics</h2>
                    <div className="grid sm:grid-cols-2  gap-6">

                        <div className="shadow-xs p-6 pt-7 bg-white rounded-[10px] ">
                            <div className="flex items-center justify-between mb-4 text-neutral-600">
                                <span className='text-sm leading-5 font-medium '>Current Weight</span>
                                <MonitorOff size={20} />
                            </div>
                            <div className="text-3xl leading-9 font-bold text-neutral-900 mb-1.5">{data.weight} kg</div>
                            <span className={`text-sm leading-5 text-neutral-900 flex items-center gap-1 ${user?.primaryFitnessGoal !== "Gain muscle" ? data.lastWeight < data.weight ? "text-red!" : "text-green!" : data.lastWeight < data.weight ? "text-green!" : "text-red!"}`}>
                                <ArrowUp size={20} className={` ${user?.primaryFitnessGoal !== "Gain muscle" ? data.lastWeight < data.weight ? "rotate-180" : "" : data.lastWeight < data.weight ? "" : "rotate-180"}`} />
                                {data.lastWeight && `From ${data.lastWeight} kg (last week)`}
                            </span>
                        </div>
                        <div className="shadow-xs p-6 pt-7 bg-white rounded-[10px] ">
                            <div className="flex items-center justify-between mb-4 text-neutral-600">
                                <span className='text-sm leading-5 font-medium '>BMI</span>
                                <Scale size={20} />
                            </div>
                            <div className="text-3xl leading-9 font-bold text-neutral-900 mb-1.5">{Number(data.bmi).toFixed(2)}</div>
                            <span className={`text-sm leading-5 text-neutral-900 flex items-center gap-1 ${data.bmi > 25 ? "text-red" : "text-green!"}`}>{data.bmi > 31 ? "Obese" : data.bmi > 24.5 ? "Overweight" : data.bmi < 18.5 ? "Underweight" : "Healthy"}</span>
                        </div>

                        <div className="shadow-xs p-6 pt-7 bg-white rounded-[10px] ">
                            <div className="flex items-center justify-between mb-4 text-neutral-600">
                                <span className='text-sm leading-5 font-medium '>Workout Streak</span>
                                <Bike size={20} />
                            </div>
                            <div className="text-3xl leading-9 font-bold text-neutral-900 mb-1.5">{data.streak} days</div>
                            <span className={`text-sm leading-5 text-neutral-900 flex items-center gap-1 ${data.streak ? "text-green!" : ""}`}>{data.streak === true && <ArrowUp size={20} />} Longest streak: {user?.longestStreak} days</span>
                        </div>

                        <div className="shadow-xs p-6 pt-7 bg-white rounded-[10px] ">
                            <div className="flex items-center justify-between mb-4 text-neutral-600">
                                <span className='text-sm leading-5 font-medium '>Daily Calorie Goal</span>
                                <Goal size={20} />
                            </div>
                            <div className="text-3xl leading-9 font-bold text-neutral-900 mb-1.5">{data.streak === true && <ArrowUp size={20} />} {data.calories.current} / {data.calories.target} kcal</div>
                            <span className={`text-sm leading-5 text-neutral-900 flex items-center gap-1 ${data.calories.current > 0 ? "text-green!" : ""}`}>{data.calories.current > 0 ? <ArrowUp size={20} /> : ""} {(data.calories.current / data.calories.target * 100).toFixed(0)}% complete</span>

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
                            <LineChart data={data.weightsData}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis domain={['auto', 'auto']} />
                                <Tooltip />
                                <Legend />
                                <Line
                                    name='Weight (kg)'
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
                {/* quick banners to each of the pages */}
                <div className="flex flex-col gap-4 ">
                    <h2 className='section-title'>Quick Summaries</h2>
                    <div className="grid sm:p-0 justify-center sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        <div className="_border rounded-[10px] max-w-[400px] md:max-w-full  p-6 pt-[25px]  flex flex-col justify-between gap-1 bg-white">
                            <div className="flex flex-col mb-6 gap-1.5">
                                <h3 className='text-xl leading-7 font-semibold  text-neutral-900'>Today's Workout Plan</h3>

                                <p className='text-neutral-600 text-left text-sm leading-5 mb-auto '>
                                    <span>{workouts?.items[workouts.todayWorkoutNumber].day}: </span>
                                    {workouts?.items[workouts.todayWorkoutNumber].exercises.map((item, idx) => {
                                        const minutes = String(Math.floor(item.time! / 60)).padStart(2, "0");
                                        const seconds = String(item.time! % 60).padStart(2, "0");
                                        return (
                                            <span key={idx}>{item.title} {item.time !== null ? minutes + ":" + seconds + " mins" : item.repeats + " repeats"}{workouts?.items[workouts.todayWorkoutNumber].exercises[idx + 1] ? "," : "."} </span>
                                        )
                                    })}

                                </p>
                            </div>
                            <div className="flex flex-col  ">
                                <div className="rounded-lg overflow-hidden aspect-video relative ">
                                    <Image className=' ' src={"/dashboard/workout.jpg"} fill alt='workout image' />
                                </div>
                                <Link href={`/workout/${data.day + 1}`} className='mt-4 button-green'>View Workout</Link>
                            </div>
                        </div>
                        <div className="_border rounded-[10px] max-w-[400px] md:max-w-full  p-6 pt-[25px]  flex flex-col justify-between gap-1 bg-white">
                            <div className="flex flex-col  gap-1.5">
                                <h3 className='text-xl leading-7 font-semibold  text-neutral-900'>Your Nutrition Summary</h3>
                                <p className='text-neutral-600 text-sm leading-5  '>Remaining: {nutritionDay?.dailyGoals.calories.target! - nutritionDay?.dailyGoals.calories.current!} kcal. Focus on protein and vegetables.</p>
                            </div>
                            <div className="flex flex-col">
                                <div className="rounded-lg overflow-hidden aspect-video relative ">
                                    <Image className=' ' src={"/dashboard/nutrition.jpg"} fill alt='food image' />
                                </div>
                                <Link href={`/nutrition-plan`} className='mt-4 button-green'>View Nutrition Plan</Link>
                            </div>
                        </div>
                        <div className="_border rounded-[10px] max-w-[400px] md:max-w-full  p-6 pt-[25px]  justify-between  flex flex-col gap-1 bg-white">
                            <div className="flex flex-col mb-6 gap-1.5">
                                <h3 className='text-xl leading-7 font-semibold  text-neutral-900'>Recent Photo Analysis</h3>
                                <p className='text-neutral-600 text-sm leading-5'>Go check your ai-analyzed photo statistics</p>
                            </div>
                            <div className="flex flex-col  ">
                                <div className="rounded-lg overflow-hidden aspect-video relative ">
                                    <Image className=' ' src={"/dashboard/analysis.jpg"} fill alt='brain image' />
                                </div>
                                <Link href={`/ai-analysis`} className='mt-4 button-green'>View Image Analysis</Link>
                            </div>
                        </div>

                        <div className="_border rounded-[10px] max-w-[400px] md:max-w-full  p-6 pt-[25px] justify-between  flex flex-col gap-1 bg-white">
                            <div className="flex flex-col mb-6 gap-1.5">
                                <h3 className='text-xl leading-7 font-semibold  text-neutral-900'>Your progress</h3>
                                <p className='text-neutral-600 text-left text-sm leading-5 flex gap-0.5'>
                                    Go check your progress process
                                </p>
                            </div>
                            <div className="flex flex-col  ">
                                <div className="rounded-lg overflow-hidden aspect-video relative ">
                                    <Image className=' ' src={"/dashboard/progress.jpg"} fill alt='image of a running-person' />
                                </div>
                                <Link href={`/progress`} className='mt-4 button-green'>View Progress</Link>
                            </div>
                        </div>
                    </div>

                </div>

            </>}

        </div >
    )
}

export default page;