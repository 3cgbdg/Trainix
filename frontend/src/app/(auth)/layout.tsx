import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-6 bg-canvas p-3 sm:gap-8 sm:p-6">
            <Link href="/" className="flex items-center gap-1.5 text-green">
                <Logo size={32} />
                <span className="font-outfit text-2xl font-bold leading-none">Trainix</span>
            </Link>
            {children}
        </div>
    );
}








