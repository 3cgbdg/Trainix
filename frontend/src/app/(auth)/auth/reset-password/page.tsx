"use client"
import { api } from "@/api/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Image from "next/image"
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type formType = {
    newPassword: string;
    confirmPassword: string;
}

const resetPassword = async (data: { email: string; token: string; newPassword: string }) => {
    const res = await api.post(`/api/auth/reset-password`, data);
    return res.data;
};

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const email = searchParams.get("email") ?? "";
    const { register, handleSubmit, watch, formState: { errors } } = useForm<formType>();
    const mutation = useMutation({
        mutationFn: (data: formType) => resetPassword({ email, token, newPassword: data.newPassword }),
        onSuccess: () => {
            router.push("/auth/login");
        },
    });
    const resetError = mutation.isError
        ? (isAxiosError(mutation.error) ? mutation.error.response?.data?.message : null) ?? "Could not reset your password. Please try again."
        : null;
    const onSubmit: SubmitHandler<formType> = async (data) => {
        mutation.mutate(data);
    }

    if (!token || !email) {
        return (
            <p role="alert" className="w-full rounded-control border border-border bg-surface-muted p-4 text-center text-sm text-strong">
                This reset link is missing or invalid. <Link href="/auth/forgot-password" className="link">Request a new one</Link>.
            </p>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-2">
                <label className="text-sm leading-[22px] font-medium" htmlFor="newPassword">New password</label>
                <input {...register("newPassword", {
                    validate: {
                        password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value) || "Password must have at least one lowercase, one uppercase, one digit and minimum 8 characters",
                    }
                })} className="input w-full" placeholder="Enter your new password" type="password" id="newPassword" />
                {errors.newPassword && (
                    <span data-testid='error' className="text-red-500 font-medium">
                        {errors.newPassword.message}
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm leading-[22px] font-medium" htmlFor="confirmPassword">Confirm new password</label>
                <input {...register("confirmPassword", {
                    validate: (value) => value === watch("newPassword") || "Passwords do not match",
                })} className="input w-full" placeholder="Confirm your new password" type="password" id="confirmPassword" />
                {errors.confirmPassword && (
                    <span data-testid='error' className="text-red-500 font-medium">
                        {errors.confirmPassword.message}
                    </span>
                )}
            </div>
            {resetError && (
                <span role="alert" className="text-red-500 font-medium">
                    {resetError}
                </span>
            )}
            <button className="button-green" disabled={mutation.isPending}>{mutation.isPending ? "Updating…" : "Reset password"}</button>
        </form>
    );
}

const Page = () => {
    return (
        <div className="flex w-full max-w-[460px] flex-col items-center rounded-card border border-border bg-surface p-6 sm:p-10">
            <div className="mb-4">
                <Image className="size-[120px]" width={120} height={120} alt="Reset your password" src="/lock.png" priority />
            </div>
            <div className="flex flex-col gap-4 text-center mb-4">
                <h1 className="text-neutral-900 leading-8 text-2xl font-bold">Choose a new password</h1>
            </div>
            <Suspense fallback={null}>
                <ResetPasswordForm />
            </Suspense>
            <Link href={"/auth/login"} className="w-full button-transparent hover:underline">Back to login</Link>
        </div>
    )
}

export default Page
