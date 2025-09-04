"use client"
import { useAppSelector } from "@/hooks/reduxHooks"
import { IDayPlan } from "@/types/types"
import { Bolt, CalendarDays } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"


const Page = () => {
    const router = useRouter();
    const { workouts } = useAppSelector(state => state.workouts);
    return (

        <>
            {workouts ? <>
                <div className='flex flex-col gap-6'>
                    <h1 className='page-title '>Workout Plan</h1>
                    <div className=" _workout-plan-banner sm:py-1 px-8 py-4  min-h-60 flex items-center  justify-between  ">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-4 mb-1">
                                <Bolt size={32} color="white" />
                                <div className="flex flex-col gap-0.5 ">
                                    <h2 className='banner-title'>Full Body Strength</h2>
                                    <p className='text-lg leading-7 text-[#19191FFF]'>Week - &quot;{workouts.currentWeekTitle}&quot;</p>
                                </div>
                            </div>
                            <p className="text-lg leading-7 text-custom-black">Your AI-powered plan is ready to guide you through this week&apos;s routines. Stay consistent for optimal results!</p>
                            <Link className="button-green max-w-[182px] w-full" href={`/workout/${workouts.todayWorkoutNumber + 1}`}>Start Today&apos;s Workout</Link>
                        </div>
                    </div>


                    <div className="flex flex-col gap-4 ">
                        <h2 className='section-title'>Weekly Schedule</h2>
                        <div className="grid sm:p-0 p-5 sm:grid-cols-3 grid-cols-1 lg:grid-cols-4 gap-6">
                            {
                                workouts.items.map((item: IDayPlan, idx: number) => (
                                    <div key={idx} className=" p-4 pt-5.5 bg-white rounded-md _border flex flex-col  ">
                                        <div className="flex items-center justify-between xl:mb-8 mb-4 flex-col gap-2 xl:flex-row">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="text-neutral-600" size={20} />
                                                <span className={`text-lg leading-7 font-semibold`}>{workouts.dates[idx].weekDay}</span>
                                            </div>
                                            <span className={`text-xs leading-5  p-1.5 rounded-2xl ${item.status === "Pending" ? "bg-[#E67E00FF] text-white" : item.status === "Missed" ? "text-white bg-red" : "text-neutral-900"} `}>{item.status}</span>

                                        </div>
                                        <div className="flex flex-col justify-between grow-1 gap-2">
                                            <div className="flex flex-col gap-2 ">
                                                <span className="text-sm leading-5">{workouts.dates[idx].monthAndDate}</span>
                                                <span className="font-medium text-neutral-900">{item.day}</span>
                                                <span></span>
                                            </div>
                                            {item.status !== "Completed" &&
                                                <div className="flex justify-end ">
                                                    <div onClick={() => router.push(`/workout/${idx + 1}`)} className=" button-transparent max-w-[110px]  w-full">View Details</div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                ))}



                        </div>

                    </div>


                </div>
            </> : <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mx-auto mt-20"></div>}
        </>
    )
}

export default Page