"use client"

import { api } from "@/api/axiosInstance"
import { useAppDispatch } from "@/hooks/reduxHooks"
import { logOut } from "@/redux/authSlice"
import { useMutation } from "@tanstack/react-query"
import { UserRound, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const Header = () => {
    const [panel, setPanel] = useState<"menu" | null>(null);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const logOutFunc = async () => {
        await api.delete("/api/auth/logout");
    }

    const mutation = useMutation({
        mutationFn: logOutFunc,
        onSuccess: () => {
            dispatch(logOut());
            router.push("/auth/login");
        }
    })
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            if (!target.closest(".panel")) {
                setPanel(null);
            }
        };

        if (panel) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [panel]);

    return (
        <div className="flex items-center justify-between bg-white py-[14px] px-6 relative">
            <Link href={"/dashboard"} className="flex items-center group hover:text-[#468438FF] gap-1 w-fit hover: text-green">

                <Image className="stroke-black transition-transform group-hover:rotate-90" width={32} height={32} src="/logo.svg" alt="logo" />

                <span className={` transiiton-colors relative top-2 font-borel text-2xl leading-none  font-bold `}>Trainix</span>
            </Link>
            <div className="relative">
            <button onClick={() => setPanel(panel !== "menu" ? "menu" : null)} className={`size-[36px] cursor-pointer  hover:text-[#468438FF] hover:border-[#468438FF] ${panel === "menu" ? "text-[#468438FF] border-[#468438FF]" : ""} transition-colors rounded-full overflow-hidden _border flex items-center justify-center p-2`}>
                {panel !== "menu" ? <UserRound /> : <X />}
            </button>
            {panel &&
                <div className=" absolute min-w-[250px] right-0 top-[140%] panel">
                    <div className="_border  rounded-lg p-5 bg-white">
                        <h3 className="font-semibold pb-1 border-b mb-2">Profile</h3>
                        <div className="flex flex-col gap-4 items-start">
                            <button className="link" onClick={() => mutation.mutate()}>Log out</button>

                        </div>
                    </div>
                </div>
            }
            </div>

        </div>
    )
}

export default Header