"use client"
import { api } from "@/api/axiosInstance";
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
    name: string;
    surname: string;
    password: string;
    dateOfBirth: string;
    gender: string,
}
const loginUser = async (data: formType) => {
    const res = await api.post(`/api/auth/signup`, data);
    return res.data;
};
const Page = () => {
    const { register, handleSubmit, formState: {
        errors
    } } = useForm<formType>();
    const router = useRouter();
    // auth register request ->router to onboarding on sucess
    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: () => {
            router.push("/onboarding");
        },
        onError: (error) => {
            console.error("Signup failed:", error);
        },
    });
    const signupError = mutation.isError
        ? (isAxiosError(mutation.error) ? mutation.error.response?.data?.message : null) ?? "Sign up failed. Please try again."
        : null;
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const onSubmit: SubmitHandler<formType> = async (data) => {
        mutation.mutate(data);
    }
    return (
        <div className="flex w-full max-w-[560px] flex-col rounded-card border border-border bg-surface p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col gap-1.5 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-strong">Create your account</h1>
                <p className="text-sm leading-6 text-muted">One photo away from a plan built for you.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
                <div className="flex flex-col sm:flex-row  gap-4">
                    <div className="flex  flex-col gap-2">
                        <label className="text-sm font-medium text-strong" htmlFor="name">Name</label>
                        <input {...register("name", { required: "Field is required" })} className="input w-full" placeholder="Enter your name" type="text" id="name" />
                        {errors.name && (
                            <span data-testid='error' className="text-sm font-medium text-danger">
                                {errors.name.message}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-strong" htmlFor="surname">Surname</label>
                        <input {...register("surname", { required: "Field is required" })} className="input w-full" placeholder="Enter your surname" type="text" id="surname" />
                        {errors.surname && (
                            <span data-testid='error' className="text-sm font-medium text-danger">
                                {errors.surname.message}
                            </span>
                        )}
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-strong" htmlFor="dateOfBirth">Date of birth</label>
                        <input {...register("dateOfBirth", { required: "Field is required" })} className="input w-full" type="date" min="1900-01-01"
                            max="2018-12-31" id="dateOfBirth" />
                        {errors.dateOfBirth && (
                            <span data-testid='error' className="text-sm font-medium text-danger">
                                {errors.dateOfBirth.message}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-strong" htmlFor="gender">Gender</label>
                        <select defaultValue={""} id="gender" {...register("gender", { required: "Field is required" })} className="input cursor-pointer">
                            <option value=""  disabled hidden>Select your gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        {errors.gender && (
                            <span data-testid='error' className="text-sm font-medium text-danger">
                                {errors.gender.message}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-strong" htmlFor="email">Email</label>
                    <input   {...register("email", {
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
                    <label className="text-sm font-medium text-strong" htmlFor="password">Password</label>
                    <div className="relative">
                        <input {...register("password", {
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
                {signupError && (
                    <span role="alert" className="text-sm font-medium text-danger">
                        {signupError}
                    </span>
                )}
                <Button type="submit" size="lg" className="w-full" loading={mutation.isPending} loadingLabel="Creating account…">Sign Up</Button>
            </form>
            <p className="mt-4 text-center text-xs leading-5 text-subtle">
                By signing up, you agree to our <Link href="/terms" className="link">Terms of Service</Link> and <Link href="/privacy" className="link">Privacy Policy</Link>.
            </p>
            <p className="mt-4 text-center text-sm text-muted">
                Already have an account? <Link href="/auth/login" className="link">Login</Link>
            </p>
        </div>
    )
}

export default Page
