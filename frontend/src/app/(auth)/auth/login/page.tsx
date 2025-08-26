"use client"
import { api } from "@/api/axiosInstance";
import { useMutation, } from "@tanstack/react-query";
import axios from "axios";
import { Eye, EyeClosed } from "lucide-react";
import Image from "next/image"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type formType = {
    email: string;
    password: string;
}
// login request
const loginUser = async (data: formType) => {
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
            if (data.user) {
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
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const onSubmit: SubmitHandler<formType> = async (data) => {
        mutation.mutate(data);
    }
    return (
        <div className="p-10 rounded-2xl flex flex-col items-center basis-[460px] grow-0 bg-white _border">
            <div className="   mb-4 ">
                <Image width={120} height={120} alt="lock" src="/lock.png" />
            </div>
            <div className="flex items-center mb-4 gap-1 text-green">
                <div className="">
                    <Image width={48} height={48} src="/logo.svg" alt="logo" />
                </div>
                <span className={` relative top-3 font-borel text-[38px] leading-none  font-bold `}>Trainix</span>
            </div>
            <div className="flex flex-col gap-4 text-center mb-4">
                <h1 className="text-neutral-900 leading-8 text-2xl font-bold ">Access Your Fitness Journey</h1>
                <p className="text-sm leading-5 text-neutral-600 ">Login or create an account to personalize your fitness with AI.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 mb-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm leading-[22px] font-medium" htmlFor="email">Email</label>
                    <input   {...register("email", {
                        validate: {
                            // validating email format with regex
                            isValidEmailForm: (value) => {
                                if (!value) return true;
                                return /^\w+@\w+\.\w{2,3}$/.test(value) || "Wrong email format";
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
                <button className="button-green">Login</button>
            </form>
            <Link href={"/auth/signup"} className="w-full button-transparent hover:underline">Sign Up</Link>


        </div>
    )
}

export default Page