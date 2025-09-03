"use client"
import { useRouter } from 'next/navigation';
import { useAppSelector } from "@/hooks/reduxHooks"
import { UseMutateFunction } from "@tanstack/react-query"
import React from "react"
// generates each day with iterations
const GenerateNutritionPlan = ({ mutate, isPending }: { mutate: UseMutateFunction<unknown, unknown, number, unknown>, isPending: boolean }) => {
    const { workouts } = useAppSelector(state => state.workouts)
    const router = useRouter();

    return (
        <div className="flex flex-col items-center ">
            <div className="max-w-[900px] w-full text-center mt-10">
                <h1 className='page-title mb-10'>AI Nutrition Plan Generating</h1>
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