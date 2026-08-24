"use client"
import { api } from "@/api/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";

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
        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-strong" htmlFor="newPassword">New password</label>
                <input {...register("newPassword", {
                    validate: {
                        password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value) || "Password must have at least one lowercase, one uppercase, one digit and minimum 8 characters",
                    }
                })} className="input w-full" placeholder="Enter your new password" type="password" id="newPassword" />
                {errors.newPassword && (
                    <span data-testid='error' className="text-sm font-medium text-danger">
                        {errors.newPassword.message}
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-strong" htmlFor="confirmPassword">Confirm new password</label>
                <input {...register("confirmPassword", {
                    validate: (value) => value === watch("newPassword") || "Passwords do not match",
                })} className="input w-full" placeholder="Confirm your new password" type="password" id="confirmPassword" />
                {errors.confirmPassword && (
                    <span data-testid='error' className="text-sm font-medium text-danger">
                        {errors.confirmPassword.message}
                    </span>
                )}
            </div>
            {resetError && (
                <span role="alert" className="text-sm font-medium text-danger">
                    {resetError}
                </span>
            )}
            <Button type="submit" size="lg" className="w-full" loading={mutation.isPending} loadingLabel="Updating…">Reset password</Button>
        </form>
    );
}

const Page = () => {
    return (
        <div className="flex w-full max-w-[440px] flex-col rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col gap-1.5 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-strong">Choose a new password</h1>
            </div>
            <Suspense fallback={null}>
                <ResetPasswordForm />
            </Suspense>
            <p className="mt-6 text-center text-sm text-muted">
                <Link href="/auth/login" className="link">Back to login</Link>
            </p>
        </div>
    )
}

export default Page
