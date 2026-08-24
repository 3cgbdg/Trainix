"use client"
import { api, resumeSessionRefresh } from "@/api/axiosInstance";
import { useMutation, } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";

type formType = {
    email: string;
    password: string;
}
// login request
const loginUser = async (data: formType) => {
    resumeSessionRefresh();
    const res = await api.post(`/api/auth/login`, data);
    return res.data;
};
const Page = () => {
    const { register, handleSubmit, formState: {
        errors
    } } = useForm<formType>();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            if (data.user.metrics) {
                router.push("/dashboard");
                // fully-registered -> dashboard
            } else {
                //otherwise -> onboarding
                router.push("/onboarding");

            }
        },
        onError: (error) => {
            console.error("Login failed:", error);
        },
    });
    const loginError = mutation.isError
        ? (isAxiosError(mutation.error) ? mutation.error.response?.data?.message : null) ?? "Login failed. Please try again."
        : null;
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const onSubmit: SubmitHandler<formType> = async (data) => {
        mutation.mutate(data);
    }
    return (
        <div className="flex w-full max-w-[440px] flex-col rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col gap-1.5 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-strong">Welcome back</h1>
                <p className="text-sm leading-6 text-muted">Login to see today&apos;s workout, meals, and progress.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-strong" htmlFor="email">Email</label>
                    <input    {...register("email", {
                        validate: {
                            // validating email format with regex
                            isValidEmailForm: (value) => {
                                if (!value) return true;
                                return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) || "Wrong email format";
                            },
                            isEmpty: (value) => {
                                return value.length !== 0 || "Field is required";
                            },
                        }
                    })} className="input w-full" placeholder="Enter your email" type="text" id="email" />
                    {errors.email && (
                        <span data-testid='error' className="text-sm font-medium text-danger">
                            {errors.email.message}
                        </span>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-strong" htmlFor="password">Password</label>
                        <Link href="/auth/forgot-password" className="link">Forgot password?</Link>
                    </div>
                    <div className="relative">
                        <input  {...register("password", {
                            validate: {
                                password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value) || "Password must have at least one lowercase, one uppercase, one digit and minimum 8 characters",
                            }
                        })} className="input w-full pr-11" placeholder="Enter your password" type={`${showPassword ? "text" : "password"}`} id="password" />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-subtle transition-colors hover:text-strong"
                        >
                            {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && (
                        <span data-testid='error' className="text-sm font-medium text-danger">
                            {errors.password.message}
                        </span>
                    )}
                </div>
                {loginError && (
                    <span role="alert" className="text-sm font-medium text-danger">
                        {loginError}
                    </span>
                )}
                <Button id="log-in-btn" type="submit" size="lg" className="w-full" loading={mutation.isPending} loadingLabel="Logging in…">Login</Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted">
                Don&apos;t have an account? <Link href="/auth/signup" className="link">Sign up</Link>
            </p>
        </div>
    )
}

export default Page
