"use client"
import { api } from "@/api/axiosInstance";
import { useMutation, } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Eye, EyeClosed } from "lucide-react";
import Image from "next/image"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Logo } from "@/components/ui/Logo";

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
        <div className="flex w-full max-w-[560px] flex-col items-center rounded-card border border-border bg-surface p-6 sm:p-10">
            <div className="   mb-4 ">
                <Image className="size-[120px]" width={120} height={120} alt="Secure account creation" src="/lock.png" priority />
            </div>
            <div className="flex items-center mb-4 gap-1 text-green">
                <div className="">
                    <Logo size={48} />
                </div>
                <span className={` relative top-3 font-outfit text-[38px] leading-none  font-bold `}>Trainix</span>
            </div>
            <div className="flex flex-col gap-4 text-center mb-4">
                <h1 className="text-neutral-900 leading-8 text-2xl font-bold ">Access Your Fitness Journey</h1>
                <p className="text-sm leading-5 text-neutral-600 ">Login or create an account to personalize your fitness with AI.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row  gap-4">
                    <div className="flex  flex-col gap-2">
                        <label className="text-sm leading-[22px] font-medium" htmlFor="name">Name</label>
                        <input {...register("name", { required: "Field is required" })} className="input w-full" placeholder="Enter your name" type="text" id="name" />
                        {errors.name && (
                            <span data-testid='error' className="text-red-500 font-medium ">
                                {errors.name.message}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm leading-[22px] font-medium" htmlFor="surname">Surname</label>
                        <input {...register("surname", { required: "Field is required" })} className="input w-full" placeholder="Enter your surname" type="text" id="surname" />
                        {errors.surname && (
                            <span data-testid='error' className="text-red-500 font-medium ">
                                {errors.surname.message}
                            </span>
                        )}
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm leading-[22px] font-medium" htmlFor="dateOfBirth">Date of birth</label>
                        <input {...register("dateOfBirth", { required: "Field is required" })} className="input w-full" type="date" min="1900-01-01"
                            max="2018-12-31" id="dateOfBirth" />
                        {errors.dateOfBirth && (
                            <span data-testid='error' className="text-red-500 font-medium ">
                                {errors.dateOfBirth.message}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm leading-[22px] font-medium" htmlFor="gender">Gender</label>
                        <select defaultValue={""} id="gender" {...register("gender", { required: "Field is required" })} className="input cursor-pointer">
                            <option value=""  disabled hidden>Select your gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        {errors.gender && (
                            <span data-testid='error' className="text-red-500 font-medium ">
                                {errors.gender.message}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm leading-[22px] font-medium" htmlFor="email">Email</label>
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
                        <span data-testid='error' className="text-red-500 font-medium ">
                            {errors.email.message}
                        </span>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm leading-[22px] font-medium" htmlFor="password">Password</label>
                    <input {...register("password", {
                        validate: {
                            password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value) || "Password must have at least one lowercase, one uppercase, one digit and minimum 8 characters",
                        }
                    })} className="input w-full" placeholder="Enter your password" type={`${showPassword ? "text" : "password"}`} id="password" />
                    {errors.password && (
                        <span data-testid='error' className="text-red-500 font-medium ">
                            {errors.password.message}
                        </span>
                    )}
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 cursor-pointer transition-all hover:text-green w-fit flex items-center text-sm gap-1"> {!showPassword ? <>Show password <Eye size={18} /></> : <>Unshow password <EyeClosed size={18} /></>}</button>
                </div>
                {signupError && (
                    <span role="alert" className="text-red-500 font-medium">
                        {signupError}
                    </span>
                )}
                <button className="button-green ">Sign Up</button>
            </form>
            <p className="mb-4 text-center text-xs leading-5 text-neutral-600">
                By signing up, you agree to our <Link href="/terms" className="link">Terms of Service</Link> and <Link href="/privacy" className="link">Privacy Policy</Link>.
            </p>
            <Link href={"/auth/login"} className="button-transparent w-full hover:underline">Login</Link>


        </div>
    )
}

export default Page
