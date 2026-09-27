"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MoreVertical, Users, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ConversationPage() {
    const params = useParams();
    const router = useRouter();
    const conversationId = params.conversationId as Id<"conversations">;

    const conversations = useQuery(api.conversations.getMyConversations);
    const conversation = conversations?.find((c) => c._id === conversationId);
    const members = useQuery(api.conversations.getMembers, { conversationId });
    const me = useQuery(api.users.currentUser);
    const leaveGroup = useMutation(api.conversations.leaveGroup);
    const deleteGroup = useMutation(api.conversations.deleteGroup);
    const [replyingTo, setReplyingTo] = useState<any | null>(null);

    if (conversations === undefined) {
        return (
            <div className="h-full flex items-center justify-center bg-zinc-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-zinc-500">Loading...</span>
                </div>
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="h-full flex items-center justify-center bg-zinc-50">
                <div className="text-center">
                    <p className="text-zinc-500 mb-3">Conversation not found</p>
                    <Button variant="outline" onClick={() => router.push("/")}>
                        Go back
                    </Button>
                </div>
            </div>
        );
    }

    const isGroup = conversation.isGroup;
    const name = isGroup ? conversation.name : conversation.otherMember?.name || "Unknown User";
    const image = isGroup ? conversation.groupImage : conversation.otherMember?.imageUrl;
    const isAdmin = me && conversation.adminId === me._id;
    const memberCount = members?.length ?? 0;

    const handleLeaveGroup = async () => {
        await leaveGroup({ conversationId });
        router.push("/");
    };

    const handleDeleteGroup = async () => {
        await deleteGroup({ conversationId });
        router.push("/");
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <header className="px-4 py-2.5 bg-card/80 backdrop-blur-md flex items-center gap-3 shadow-sm border-b border-border z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    onClick={() => router.push("/")}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <Avatar className="h-10 w-10 border-2 border-border/50">
                    <AvatarImage src={image} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                        {name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{name}</h3>
                    {isGroup && (
                        <span className="text-xs text-muted-foreground">
                            {memberCount} member{memberCount !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                {isGroup && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem className="gap-2 text-sm text-popover-foreground focus:bg-secondary focus:text-secondary-foreground">
                                <Users className="h-4 w-4" />
                                Group members ({memberCount})
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                                className="gap-2 text-sm text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onClick={handleLeaveGroup}
                            >
                                <LogOut className="h-4 w-4" />
                                Leave Group
                            </DropdownMenuItem>
                            {isAdmin && (
                                <DropdownMenuItem
                                    className="gap-2 text-sm text-destructive focus:bg-destructive/10 focus:text-destructive"
                                    onClick={handleDeleteGroup}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Group
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </header>

            <MessageList conversationId={conversationId} setReplyingTo={setReplyingTo} />
            <ChatInput conversationId={conversationId} replyingTo={replyingTo} setReplyingTo={setReplyingTo} />
        </div>
    );
}
