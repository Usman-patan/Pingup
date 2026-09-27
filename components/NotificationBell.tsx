"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ChatRequestDialog from "./ChatRequestDialog";

export default function NotificationBell() {
    const count = useQuery(api.chatRequests.getPendingCount);
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                title="Chat Requests"
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent relative"
                onClick={() => setOpen(true)}
            >
                <Bell className="h-5 w-5" />
                {(count ?? 0) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 shadow-md animate-pulse">
                        {count}
                    </span>
                )}
            </Button>
            <ChatRequestDialog open={open} onOpenChange={setOpen} />
        </>
    );
}
