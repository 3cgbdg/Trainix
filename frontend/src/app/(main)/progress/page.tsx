"use client"
import { api } from '@/api/axiosInstance';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useQuery } from '@tanstack/react-query';
import { ArrowUp, Bike, Footprints, Percent, Scale } from 'lucide-react'
import Image from 'next/image'

import { useCallback, useEffect, useState } from 'react';

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



const Page = () => {
    const { user } = useAppSelector(state => state.auth);
    const [chartData, setChartData] = useState<{ month: string, bodyFat: number, bmi: number }[] | null>(null);
    const getNumbers = useCallback(async () => {
        const res = await api.get(`/api/fitness-plan/reports/numbers`, { params: { date: new Date(), progress: true } });
        return res.data;
    },[]);

    const { data, isLoading, isSuccess } = useQuery({
        queryKey: ["numbers", new Date().toISOString().split('T')[0]],
        queryFn: getNumbers,
    })
    useEffect(() => {
        if (isSuccess) {
            setChartData(data.fatsData.map((item: { month: string, bodyFat: number }, idx: number) => ({
                month: item.month,
                bodyFat: item.bodyFat,
                bmi: data.bmiData[idx].bmi,
            })))
        }
    }, [isSuccess])

    return (
        <div className='flex flex-col gap-6'>
            <h1 className='page-title '>Your Progress Overview</h1>

            {!isLoading ? <>
                <div className="flex flex-col gap-4 ">
                    {/* metrics banners */}
                    <h2 className='section-title'>Your Key Metrics</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-6">

                         <div className="shadow-xs p-6 pt-7 bg-white rounded-[10px] flex flex-col justify-between gap-2 _border">
                            <div className="flex items-center justify-between mb-2 text-neutral-900">
                                <span className='text-lg leading-7 font-semibold '>Weight Lost</span>
                                <Scale className='text-neutral-600' size={24} />
                            </div>
                            
                            <div className="">
                            <div className={`text-4xl leading-10 font-bold text-neutral-900 mb-4 ${data.lastWeight >= data.weight ? "text-green!" : "text-red!"}`}>{data.weight} kg</div>
                            <span className={`text-sm leading-5 font-medium text-neutral-900 flex items-center gap-1 ${data.lastWeight >= data.weight ? "text-green!" : "text-red!"}`}>
                                
                                {data.lastWeight && `From ${data.lastWeight} kg (last week)`}
                            </span>
                        </div>
                        </div>

                        <div className="shadow-xs p-6 pt-7 flex flex-col justify-between gap-2 bg-white rounded-[10px] _border">
                            <div className="flex items-center justify-between mb-2 text-neutral-900">
                                <span className='text-lg leading-7 font-semibold '>Body Fat %</span>
                                <Percent className='text-neutral-600' size={24} />
                            </div>
                            <div className="">
                            <div className={`text-4xl leading-10 font-bold text-neutral-900 mb-4 ${!data.fatsData[data.fatsData.length - 2] ? "text-green!" : data.fatsData[data.fatsData.length - 2].bodyFat >= data.bodyFat ? "text-green!" : "text-red!"}`}>{data.bodyFat}%</div>
                            {data.fatsData[data.fatsData.length - 2] && <span className={`text-sm leading-5 font-medium text-neutral-900 flex items-center gap-1 ${data.fatsData[data.fatsData.length - 2].bodyFat >= data.bodyFat ? "text-green!" : "text-red!"}`}>
                                `${data.bodyFat - data.fatsData[data.fatsData.length - 2].bodyFat} % (last month)`
                            </span>}
                            </div>
                        </div>

                        <div className="shadow-xs p-6 pt-7 bg-white rounded-[10px] _border">
                            <div className="flex items-center justify-between mb-2 text-neutral-900">
                                <span className='text-lg leading-7 font-semibold '>Workout Streak</span>
                                <Bike size={24} />
                            </div>
                            <div className={`text-4xl leading-10 font-bold  text-neutral-900 mb-4 ${data.streak ? "text-green!" : ""}`}>{data.streak} days</div>
                            <span className={`text-sm leading-5 font-medium text-neutral-900 flex items-center gap-1 ${data.streak ? "text-green!" : ""}`}>{data.streak === true && <ArrowUp size={20} />} Longest streak: {user?.longestStreak} days</span>
                        </div>

                        <div className="shadow-xs p-6 pt-7 flex flex-col justify-between gap-2 bg-white rounded-[10px] _border">
                            <div className="flex items-center justify-between mb-2 text-neutral-900">
                                <span className='text-lg leading-7 font-semibold '>BMI</span>
                                <Footprints className='text-neutral-600' size={24} />
                            </div>
                            <div className="">
                            <div className={`text-4xl leading-10 font-bold text-neutral-900 mb-4 ${!data.bmiData[data.bmiData.length - 2] ? data.bmi > 25 ? "text-red!" : "text-green!" : data.bmiData[data.bmiData.length - 2].bmi >= data.dmi ? "text-green!" : data.bmi > 25 ? "text-red!" : "text-green!"}`}>{data.bmi}</div>
                            {data.bmiData[data.bmiData.length - 2] && <span className={`text-sm leading-5 font-medium text-neutral-900 flex items-center  gap-1 ${data.bmiData[data.bmiData.length - 2].bmi >= data.dmi ? "text-green!" : "text-red!"}`}>
                                `${data.bmi - data.bmiData[data.bmiData.length - 2].bmi} (last month)`
                            </span>}
                            </div>
                        </div>
                    </div>

                </div>
                {/* chart using recharts */}
                {chartData &&
                    <div className="mb-8">

                        <h2 className='section-title mb-4'>Progress Trends</h2>

                        <div className="grid lg:grid-cols-2 gap-6">

                            <div className="rounded-[10px] bg-white p-6 shadow-xs _border">
                                <div className="mb-6 flex flex-col gap-1.5">
                                    <h2 className="text-xl font-semibold leading-7 ">Weight Trend (Last 6 Months)</h2>
                                    <p className="text-sm leading-5 text-neutral-600 ">Your body weight changes over the last 6 months.</p>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={data.weightsData}>
                                        <CartesianGrid vertical={false} />
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
                            <div className="rounded-[10px] bg-white p-6 shadow-xs _border">
                                <div className="mb-6 flex flex-col gap-1.5">
                                    <h2 className="text-xl font-semibold leading-7 ">Body Composition (Last 6 Months)</h2>
                                    <p className="text-sm leading-5 text-neutral-600 ">Changes in BMI and Body Fat Percentage over time.</p>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="month" />
                                        <YAxis domain={['auto', 'auto']} />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            name='BMI'
                                            dataKey="bmi"
                                            stroke="#22c55e"
                                            dot={{ stroke: "#22c55e", strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line
                                            type="monotone"
                                            name='Body Fat (%)'
                                            dataKey="bodyFat"
                                            stroke="#ff852e"
                                            dot={{ stroke: "#ff852e", strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                        </div>
                    </div>
                }
                {/* progres photos for last months */}
                <div className="flex flex-col gap-6">
                    <h2 className="section-title">Progress Photos</h2>
                    <div className="gap-6 flex  flex-wrap sm:grid! grid-cols-2 md:grid-cols-3  lg:grid-cols-4">
                        {data.imagesData.map((item: { date: string, imageUrl: string }, idx: number) => (
                            <div key={idx} className="rounded-[10px] _border flex sm:max-w-full max-w-[300px] w-full flex-col gap-2 p-2">
                                <div className=" aspect-square overflow-hidden rounded-md relative ">
                                    <Image className='object-cover object-top' fill src={item.imageUrl} alt='body picture'/>
                                </div>
                                <span className='text-sm text-neutral-600'>{item.date}</span>

                            </div>
                        ))}
                    </div>
                </div>

            </>:<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green border-solid mx-auto mt-20"></div>}

        </div >
    )
}

export default Page