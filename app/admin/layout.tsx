import { AdminChatWidget } from "@/components/admin-chat";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen">
            {children}
            <AdminChatWidget />
        </div>
    );
}
