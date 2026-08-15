
export default async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <div className="flex min-h-dvh w-full items-center justify-center bg-canvas p-3 sm:p-6">
            {children}
        </div>
    );
}








