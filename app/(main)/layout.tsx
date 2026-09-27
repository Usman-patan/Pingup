"use client";

import Sidebar from "@/components/Sidebar";
import UserStore from "@/components/UserStore";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";

const MIN_SIDEBAR_WIDTH = 280;
const MAX_SIDEBAR_WIDTH = 500;
const DEFAULT_SIDEBAR_WIDTH = 360;

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
    const isResizing = useRef(false);

    useEffect(() => {
        setMounted(true);
        // Load saved width from localStorage
        const saved = localStorage.getItem("pingup-sidebar-width");
        if (saved) {
            const w = parseInt(saved, 10);
            if (w >= MIN_SIDEBAR_WIDTH && w <= MAX_SIDEBAR_WIDTH) {
                setSidebarWidth(w);
            }
        }
    }, []);

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";

        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return;
            const newWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, e.clientX));
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            // Save to localStorage
            setSidebarWidth((w) => {
                localStorage.setItem("pingup-sidebar-width", String(w));
                return w;
            });
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }, []);

    // On mobile, if we're on a conversation, hide the sidebar toggle
    const isConversationView = pathname.startsWith("/conversations/");

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <UserStore />

            {/* Desktop Sidebar with resize handle */}
            <div
                className="hidden md:flex h-full shrink-0 relative"
                style={{ width: sidebarWidth }}
            >
                <Sidebar />
                {/* Resize Handle */}
                <div
                    onMouseDown={handleMouseDown}
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors z-20"
                    title="Drag to resize"
                />
            </div>

            <main className="flex-1 overflow-hidden h-full flex flex-col">
                {/* Mobile Header - only show when not in a conversation */}
                {!isConversationView && (
                    <div className="md:hidden p-3 border-b border-border flex items-center bg-primary text-primary-foreground">
                        {mounted && (
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-80 bg-sidebar border-sidebar-border">
                                    <Sidebar />
                                </SheetContent>
                            </Sheet>
                        )}
                        <span className="ml-2 font-bold text-lg">PingUp</span>
                    </div>
                )}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {children}
                </div>
            </main>
        </div>
    );
}

