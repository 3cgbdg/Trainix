"use client"

import { Banana, Camera, ChartNoAxesCombined, Dumbbell, LayoutDashboard, UserRound } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
    { title: "Dashboard", link: "/dashboard", icon: <LayoutDashboard /> },
    { title: "Workout Plan", link: "/workout-plan", icon: <Dumbbell /> },
    { title: "Nutrition Plan", link: "/nutrition-plan", icon: <Banana /> },
    { title: "AI Photo Analysis", link: "/ai-analysis", icon: <Camera /> },
    { title: "Progress", link: "/progress", icon: <ChartNoAxesCombined /> },
    { title: "Profile", link: "/profile", icon: <UserRound /> },
]

const Sidebar = () => {
    const path = usePathname();
    return (
        <div className="basis-[254px] shrink-0  p-2 _border h-full bg-white">
            {links.map(item => (
                <Link key={item.link} href={item.link} className={`p-2 flex items-center gap-2 text-sm leading-5.5 font-medium text-neutral-600 rounded-lg  ${item.link === path ? "text-neutral-300 bg-[#CDE7C7FF]" : " "} `}>{item.icon} {item.title}</Link>
            ))}
        </div>
    )
}

export default Sidebar