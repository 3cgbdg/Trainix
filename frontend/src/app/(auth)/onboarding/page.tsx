"use client"
import { api } from "@/api/axiosInstance";
import { useMutation, } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Image from "next/image"
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";

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
    const onboardingError = mutation.isError
        ? (isAxiosError(mutation.error) ? mutation.error.response?.data?.message : null) ?? "Could not save your details. Please try again."
        : null;
    const onSubmit: SubmitHandler<formType> = async (data) => {
        mutation.mutate(data);
    }
    return (
        <div className="flex w-full max-w-[672px] flex-col rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
            <div className="mb-6">
                <Image className="h-auto w-full" width={592} height={198} alt="A guided fitness journey" src="/onboarding.png" priority />
            </div>

            <div className="mb-6 flex flex-col gap-1.5 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-strong">Let&apos;s personalize your journey</h1>
                <p className="text-sm leading-6 text-muted">A few details about your current stats and goals so the AI can tailor everything to you.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-strong" htmlFor="weight">Current Weight (kg)</label>
                        <input {...register("weight", { required: "Field is required" })} className="input w-full" placeholder="e.g., 70" type="text" id="weight" />
                        {errors.weight && (
                            <span data-testid='error' className="text-sm font-medium text-danger">
                                {errors.weight.message}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-strong" htmlFor="height">Current Height (cm)</label>
                        <input {...register("height", { required: "Field is required" })} className="input w-full" placeholder="e.g., 175" type="text" id="height" />
                        {errors.height && (
                            <span data-testid='error' className="text-sm font-medium text-danger">
                                {errors.height.message}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-strong" htmlFor="targetWeight">Target Weight (kg) - Optional</label>
                    <input {...register("targetWeight")} className="input w-full" placeholder="e.g., 65" type="text" id="targetWeight" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-strong" htmlFor="fitnessLevel">Your Fitness Level</label>
                    <select  defaultValue={""} {...register("fitnessLevel", { required: "Field is required" })} className="input cursor-pointer">
                        <option value="" disabled  hidden>Select your fitness level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                    {errors.fitnessLevel && (
                        <span data-testid='error' className="text-sm font-medium text-danger">
                            {errors.fitnessLevel.message}
                        </span>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-strong" htmlFor="primaryFitnessGoal">Your Primary Fitness Goal</label>
                    <select  defaultValue={""} {...register("primaryFitnessGoal", { required: "Field is required" })} className="input cursor-pointer">
                        <option value="" disabled  hidden>Select your primary goal</option>
                        <option value="Lose weight">Lose weight</option>
                        <option value="Gain muscle">Gain muscle</option>
                        <option value="Stay fit">Stay fit</option>
                        <option value="Improve endurance">Improve endurance</option>
                    </select>
                    {errors.primaryFitnessGoal && (
                        <span data-testid='error' className="text-sm font-medium text-danger">
                            {errors.primaryFitnessGoal.message}
                        </span>
                    )}
                </div>
                {onboardingError && (
                    <span role="alert" className="text-sm font-medium text-danger">
                        {onboardingError}
                    </span>
                )}
                <Button type="submit" size="lg" className="w-full" loading={mutation.isPending} loadingLabel="Saving…">Continue to Dashboard</Button>
            </form>
        </div>
    )
}

export default Page
