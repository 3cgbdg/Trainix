"use client"
import { api } from "@/api/axiosInstance";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";

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
        <div className="flex w-full max-w-[440px] flex-col rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col gap-1.5 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-strong">Reset your password</h1>
                <p className="text-sm leading-6 text-muted">Enter the email on your account and we&apos;ll send you a link to reset your password.</p>
            </div>
            {mutation.isSuccess ? (
                <p role="status" className="w-full rounded-control border border-border bg-surface-muted p-4 text-center text-sm text-strong">
                    If an account exists for that email, we&apos;ve sent a reset link. Check your inbox.
                </p>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-strong" htmlFor="email">Email</label>
                        <input {...register("email", {
                            validate: {
                                isValidEmailForm: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) || "Wrong email format",
                                isEmpty: (value) => value.length !== 0 || "Field is required",
                            }
                        })} className="input w-full" placeholder="Enter your email" type="text" id="email" />
                        {errors.email && (
                            <span data-testid='error' className="text-sm font-medium text-danger">
                                {errors.email.message}
                            </span>
                        )}
                    </div>
                    <Button type="submit" size="lg" className="w-full" loading={mutation.isPending} loadingLabel="Sending…">Send reset link</Button>
                </form>
            )}
            <p className="mt-6 text-center text-sm text-muted">
                <Link href="/auth/login" className="link">Back to login</Link>
            </p>
        </div>
    )
}

export default Page
