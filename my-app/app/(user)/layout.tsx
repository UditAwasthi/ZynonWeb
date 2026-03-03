// app/(user)/layout.tsx
import Sidebar from "../../components/Sidebar"; // The '@' refers to the project root

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#020203]">
            <Sidebar />
            <main className="flex-1 h-screen overflow-y-auto">
                {children}
            </main>
        </div>
    );
}