import AdminHeader from "@/components/AdminHeader";
import { ToastProvider } from "@/components/ToastContext";

export default function AdminDashboardLayout({ children }) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-paper text-ink">
        <AdminHeader />
        <main className="mx-auto max-w-content px-5 py-8 md:px-8">{children}</main>
      </div>
    </ToastProvider>
  );
}