"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import CreateChatDialog from "./CreateChatDialog";
import CreateGroupDialog from "./CreateGroupDialog";
import NotificationBell from "./NotificationBell";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Sidebar() {
    const conversations = useQuery(api.conversations.getMyConversations);
    const pathname = usePathname();
    const { user } = useUser();
    const { signOut } = useClerk();
    const [filter, setFilter] = useState("");

    if (conversations === undefined) {
        return (
            <div className="w-80 border-r h-full flex flex-col bg-white">
                <div className="p-4 border-b bg-zinc-800 h-16" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-zinc-500">Loading chats...</span>
                    </div>
                </div>
            </div>
        );
    }

    const filteredConversations = conversations.filter((conv) => {
        if (!filter) return true;
        const name = conv.isGroup ? conv.name : conv.otherMember?.name;
        const q = filter.toLowerCase();
        return (
            name?.toLowerCase().includes(q) ||
            (!conv.isGroup && conv.otherMember?.email?.toLowerCase().includes(q))
        );
    });

    return (
        <div className="w-full border-r border-sidebar-border h-full flex flex-col bg-sidebar">
            {/* Header */}
            <div className="px-4 py-3 bg-sidebar flex justify-between items-center border-b border-sidebar-border">
                <Link href="/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                    <Avatar className="h-9 w-9 border-2 border-sidebar-primary/20">
                        <AvatarImage src={user?.imageUrl} />
                        <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                            {user?.firstName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm text-sidebar-foreground truncate max-w-[100px]">
                        {user?.fullName}
                    </span>
                </Link>
                <div className="flex items-center gap-1">
                    <NotificationBell />
                    <CreateChatDialog />
                    <CreateGroupDialog />
                </div>
            </div>

            {/* Search */}
            <div className="p-2 border-b border-sidebar-border bg-sidebar/50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search or start new chat"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="pl-9 h-9 bg-sidebar-accent/20 border-sidebar-border rounded-lg text-sm focus-visible:ring-sidebar-ring text-sidebar-foreground placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <ScrollArea className="flex-1">
                <div className="flex flex-col">
                    {filteredConversations.length === 0 && (
                        <div className="text-center text-muted-foreground p-8 text-sm">
                            {filter ? "No matching conversations" : "No conversations yet — start chatting!"}
                        </div>
                    )}
                    {filteredConversations.map((conv) => {
                        const isActive = pathname === `/conversations/${conv._id}`;
                        let name = conv.isGroup ? conv.name : conv.otherMember?.name;
                        const image = conv.isGroup ? conv.groupImage : conv.otherMember?.imageUrl;
                        if (!name) name = "Unknown User";

                        const lastMessageTime = conv.lastMessageTime
                            ? new Date(conv.lastMessageTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "";

                        return (
                            <Link
                                key={conv._id}
                                href={`/conversations/${conv._id}`}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 hover:bg-sidebar-accent/50 transition-colors border-b border-sidebar-border/50",
                                    isActive && "bg-sidebar-accent border-l-4 border-l-sidebar-primary"
                                )}
                            >
                                <Avatar className="h-12 w-12 shrink-0 border border-sidebar-border/50">
                                    <AvatarImage src={image} />
                                    <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground font-semibold">
                                        {name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <span className={cn("font-semibold text-sm truncate", isActive ? "text-sidebar-foreground" : "text-sidebar-foreground/90")}>
                                            {name}
                                        </span>
                                        {lastMessageTime && (
                                            <span className="text-[11px] text-muted-foreground ml-2 shrink-0">
                                                {lastMessageTime}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                        {conv.lastMessageText || (conv.isGroup ? "Group created" : "Start chatting")}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </ScrollArea>

            {/* Bottom Logout Bar */}
            <div className="px-4 py-3 border-t border-sidebar-border bg-sidebar flex items-center justify-between">
                <Link href="/settings" className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity">
                    <Avatar className="h-8 w-8 shrink-0 border border-sidebar-border/50">
                        <AvatarImage src={user?.imageUrl} />
                        <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                            {user?.firstName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-sidebar-foreground/70 truncate">{user?.fullName}</span>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    title="Sign Out"
                    className="text-sidebar-foreground/70 hover:text-red-500 hover:bg-red-500/10 shrink-0"
                    onClick={() => signOut({ redirectUrl: "/" })}
                >
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
