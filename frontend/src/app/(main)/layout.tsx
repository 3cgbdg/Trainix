import AuthClientUpload from "@/components/loads/AuthClientUpload";
import Notification from "@/components/Notification";
import { AppShell } from "@/components/layout/AppShell";

export default function ProductLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <>
      <AuthClientUpload />
      <Notification />
      <AppShell>{children}</AppShell>
    </>


  );
}







