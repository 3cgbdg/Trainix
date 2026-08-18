"use client"
import { api } from "@/api/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image"
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";

type formType = {
    email: string;
}

const requestReset = async (data: formType) => {
    const res = await api.post(`/api/auth/forgot-password`, data);
    return res.data;
};

const Page = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<formType>();
    const mutation = useMutation({ mutationFn: requestReset });
    const onSubmit: SubmitHandler<formType> = async (data) => {
        mutation.mutate(data);
    }

    return (
        <div className="flex w-full max-w-[460px] flex-col items-center rounded-card border border-border bg-surface p-6 sm:p-10">
            <div className="mb-4">
                <Image className="size-[120px]" width={120} height={120} alt="Reset your password" src="/lock.png" priority />
            </div>
            <div className="flex flex-col gap-4 text-center mb-4">
                <h1 className="text-neutral-900 leading-8 text-2xl font-bold">Reset your password</h1>
                <p className="text-sm leading-5 text-neutral-600">Enter the email on your account and we&apos;ll send you a link to reset your password.</p>
            </div>
            {mutation.isSuccess ? (
                <p role="status" className="w-full rounded-control border border-border bg-surface-muted p-4 text-center text-sm text-strong">
                    If an account exists for that email, we&apos;ve sent a reset link. Check your inbox.
                </p>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 mb-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm leading-[22px] font-medium" htmlFor="email">Email</label>
                        <input {...register("email", {
                            validate: {
                                isValidEmailForm: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) || "Wrong email format",
                                isEmpty: (value) => value.length !== 0 || "Field is required",
                            }
                        })} className="input w-full" placeholder="Enter your email" type="text" id="email" />
                        {errors.email && (
                            <span data-testid='error' className="text-red-500 font-medium">
                                {errors.email.message}
                            </span>
                        )}
                    </div>
                    <button className="button-green" disabled={mutation.isPending}>{mutation.isPending ? "Sending…" : "Send reset link"}</button>
                </form>
            )}
            <Link href={"/auth/login"} className="w-full button-transparent hover:underline">Back to login</Link>
        </div>
    )
}

export default Page
