
export default async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <div className={`py-2 flex items-center justify-center `}>
            {children}
        </div>
    );
}








