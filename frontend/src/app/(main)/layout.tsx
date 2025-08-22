import Header from "@/components/Header";
import AuthClientUpload from "@/components/loads/AuthClientUpload";
import Notification from "@/components/Notification";
import Sidebar from "@/components/Sidebar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <div className="flex flex-col h-screen  ">
      <AuthClientUpload />
      <Notification />
      <Header />
      <div className="flex items-start grow-1 bg-neutral-100">
        <Sidebar />
        <div className="p-8 w-full">
          {children}
        </div>
      </div>
    </div>


  );
}







