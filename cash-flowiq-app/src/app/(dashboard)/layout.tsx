import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen dashboard-surface text-white bg-[#121e33]">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <TopBar />
        <main className="p-6 flex-1 bg-[#020618]">{children}</main>
      </div>
    </div>
  );
}
