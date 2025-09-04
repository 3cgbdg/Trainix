"use client"
import { useRouter } from 'next/navigation';
import { useAppSelector } from "@/hooks/reduxHooks"
import { UseMutateFunction } from "@tanstack/react-query"
import React from "react"
// generates each day with iterations
const GenerateNutritionPlan = ({ mutate, isPending }: { mutate: UseMutateFunction<unknown, unknown, number, unknown>, isPending: boolean }) => {
    const { workouts } = useAppSelector(state => state.workouts)
    return (
        <div className="flex flex-col items-center ">
            <div className="max-w-[600px] _border p-6 rounded-[10px]  w-full text-center mt-20">
                <div className="flex flex-col gap-2 mb-10 text-center ">

                    <h1 className='page-title '>AI Nutrition Plan Generating</h1>
                    <p className='text-lg '>Special Nutrition plan🍓 for your body</p>

                </div>
                {isPending &&
                    <div className=' mb-8 flex items-center flex-col gap-6  h-full'> <h2 className='section-title text-green!'>Approx. time 30 sec</h2> <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green border-solid mx-auto   "></div></div>}
                <button aria-label='btn' disabled={isPending ? true : false} onClick={async () => {
                    if (workouts?.items) {
                        mutate(1);
                    }
                }} className={`button-green w-full max-w-[450px] disabled:bg-neutral-800 ${isPending ? "!bg-neutral-700 !cursor-auto" : ""}`}>{isPending ? "Processing" : "Generate Nutrition Plan"}</button>
            </div>
        </div >

    )
}

export default React.memo(GenerateNutritionPlan)