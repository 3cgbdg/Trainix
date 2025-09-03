"use client"
import { api } from "@/api/axiosInstance";
import { useMutation, } from "@tanstack/react-query";
import Image from "next/image"
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";

type formType = {
    weight: number,
    height: number,
    targetWeight: number,
    fitnessLevel: string,
    primaryFitnessGoal: string,
}
const onboardingFunc = async (data: formType) => {
    const res = await api.post("/api/auth/onboarding", data);
    return res.data;
};
const Page = () => {
    const { register, handleSubmit, formState: {
        errors
    } } = useForm<formType>();
    const router = useRouter();
// onboarding request to fully cover profile info with current metrics- weight, etc. 
    const mutation = useMutation({
        mutationFn: onboardingFunc,
        onSuccess: () => {
            router.push("/dashboard");
        },
        onError: (error) => {
            console.error("Onboarding failed:", error);
        },
    });
    const onSubmit: SubmitHandler<formType> = async (data) => {
        mutation.mutate(data);
    }
    return (
        <div className="p-10 rounded-2xl flex flex-col items-center basis-[672px] grow-0 bg-white _border">
            <div className="   mb-7 ">
                <Image width={592} height={198} alt="lock" src="/onboarding.png" />
            </div>

            <div className="flex flex-col gap-3 text-center mb-[30px]">
                <h1 className="text-green font-outfit leading-10 text-4xl font-bold ">Welcome to Trainix! Let&apos;s Personalize Your Journey</h1>
                <p className=" text-neutral-600 ">To give you the most accurate and effective fitness plans, we need a few details about your current stats and goals. This information helps our AI tailor everything just for you.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6 ">
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm leading-[22px] font-medium" htmlFor="weight">Current Weight (kg)</label>
                        <input {...register("weight", { required: "Field is required" })} className="input w-full" placeholder="e.g., 70" type="text" id="weight" />
                        {errors.weight && (
                            <span data-testid='error' className="text-red-500 font-medium ">
                                {errors.weight.message}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm leading-[22px] font-medium" htmlFor="height">Current Height (cm)</label>
                        <input {...register("height", { required: "Field is required" })} className="input w-full" placeholder="e.g., 175" type="text" id="height" />
                        {errors.height && (
                            <span data-testid='error' className="text-red-500 font-medium ">
                                {errors.height.message}
                            </span>
                        )}
                    </div>
                </div>



              
                <div className="flex flex-col gap-2">
                    <label className="text-sm leading-[22px] font-medium" htmlFor="targetWeight">Target Weight (kg) - Optional</label>
                    <input {...register("targetWeight", { required: "Field is required" })} className="input w-full" placeholder="e.g., 65" type="text" id="targetWeight" />
                    {errors.targetWeight && (
                        <span data-testid='error' className="text-red-500 font-medium ">
                            {errors.targetWeight.message}
                        </span>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm leading-[22px] font-medium" htmlFor="fitnessLevel">Your Fitness Level</label>
                    <select  defaultValue={""} {...register("fitnessLevel", { required: "Field is required" })} className="input cursor-pointer">
                        <option value="" disabled  hidden>Select your fitness level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                    {errors.fitnessLevel && (
                        <span data-testid='error' className="text-red-500 font-medium ">
                            {errors.fitnessLevel.message}
                        </span>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm leading-[22px] font-medium" htmlFor="targetWeight">Your Primary Fitness Goal</label>
                    <select  defaultValue={""} {...register("primaryFitnessGoal")} className="input cursor-pointer">
                        <option value="" disabled  hidden>Select your primary goal</option>
                        <option value="Lose weight">Lose weight</option>
                        <option value="Gain muscle">Gain muscle</option>
                        <option value="Stay fit">Stay fit</option>
                        <option value="Improve endurance">Improve endurance</option>
                    </select>
                    {errors.targetWeight && (
                        <span data-testid='error' className="text-red-500 font-medium ">
                            {errors.targetWeight.message}
                        </span>
                    )}
                </div>
                <button className="button-green">Continue to Dashboard</button>
            </form>


        </div>
    )
}

export default Page