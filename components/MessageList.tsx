"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, Reply, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageListProps {
    conversationId: Id<"conversations">;
    setReplyingTo: (msg: any) => void;
}

export default function MessageList({ conversationId, setReplyingTo }: MessageListProps) {
    const messages = useQuery(api.messages.list, { conversationId });
    const me = useQuery(api.users.currentUser);
    const editMessage = useMutation(api.messages.edit);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
    const [editContent, setEditContent] = useState("");
    const editInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (messages) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages?.length]);

    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.selectionStart = editInputRef.current.value.length;
        }
    }, [editingId]);

    const handleStartEdit = (msg: any) => {
        setEditingId(msg._id);
        setEditContent(msg.content);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditContent("");
    };

    const handleSaveEdit = async () => {
        if (!editingId || !editContent.trim()) return;
        try {
            await editMessage({ messageId: editingId, content: editContent.trim() });
            setEditingId(null);
            setEditContent("");
        } catch (error) {
            console.error("Failed to edit message:", error);
        }
    };

    if (messages === undefined || me === undefined) {
        return (
            <div className="flex-1 p-4 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-zinc-500">Loading messages...</span>
                </div>
            </div>
        );
    }

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-10 px-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                        </svg>
                    </div>
                    <p className="text-zinc-500 text-sm">No messages yet. Say hello! 👋</p>
                </div>
            </div>
        );
    }

    // Group messages by date
    const groupedMessages: { date: string; messages: typeof messages }[] = [];
    let currentDate = "";

    for (const msg of messages) {
        const date = new Date(msg._creationTime).toLocaleDateString([], {
            weekday: "long",
            month: "short",
            day: "numeric",
        });
        if (date !== currentDate) {
            currentDate = date;
            groupedMessages.push({ date, messages: [] });
        }
        groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 py-3 bg-background">
            {groupedMessages.map((group) => (
                <div key={group.date}>
                    {/* Date separator */}
                    <div className="flex justify-center my-3">
                        <span className="px-3 py-1 rounded-lg bg-secondary/50 text-xs text-secondary-foreground shadow-sm">
                            {group.date}
                        </span>
                    </div>

                    {group.messages.map((msg) => {
                        const isMe = me && msg.senderId === me._id;
                        const isEditing = editingId === msg._id;
                        return (
                            <div
                                key={msg._id}
                                className={cn(
                                    "flex gap-2 mb-1.5 max-w-[85%] group relative",
                                    isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                {!isMe && (
                                    <Avatar className="h-7 w-7 mt-auto shrink-0 border border-border/30">
                                        <AvatarImage src={msg.senderImage} />
                                        <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px]">
                                            {msg.senderName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                )}

                                <div className="flex flex-col gap-1 min-w-[120px]">
                                    <div
                                        className={cn(
                                            "px-3 py-2 rounded-lg text-sm shadow-sm relative z-10",
                                            isMe
                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                : "bg-white text-foreground rounded-tl-none border border-border/20"
                                        )}
                                    >
                                        {/* Quote Parent Message inside bubble */}
                                        {msg.parentMessageContent && (
                                            <div className={cn(
                                                "text-xs px-2 py-1 rounded bg-black/5 dark:bg-white/10 mb-2 border-l-2",
                                                isMe ? "border-primary-foreground/50" : "border-primary/50"
                                            )}>
                                                <div className="font-bold text-[10px] opacity-90 mb-0.5 truncate">
                                                    {msg.parentMessageSender}
                                                </div>
                                                <div className="truncate max-w-[180px] opacity-80">
                                                    {msg.parentMessageContent}
                                                </div>
                                            </div>
                                        )}

                                        {!isMe && (
                                            <div className="text-xs font-semibold mb-0.5 text-primary/80">
                                                {msg.senderName}
                                            </div>
                                        )}

                                        {/* Edit mode or normal content */}
                                        {isEditing ? (
                                            <div className="flex flex-col gap-2">
                                                <textarea
                                                    ref={editInputRef}
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter" && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSaveEdit();
                                                        }
                                                        if (e.key === "Escape") {
                                                            handleCancelEdit();
                                                        }
                                                    }}
                                                    className={cn(
                                                        "w-full bg-transparent border rounded px-2 py-1 text-sm resize-none focus:outline-none focus:ring-1",
                                                        isMe
                                                            ? "border-primary-foreground/30 focus:ring-primary-foreground/50 text-primary-foreground"
                                                            : "border-border focus:ring-primary/50 text-foreground"
                                                    )}
                                                    rows={2}
                                                />
                                                <div className="flex items-center gap-1 justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn("h-5 w-5", isMe ? "text-primary-foreground/70 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
                                                        onClick={handleCancelEdit}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn("h-5 w-5", isMe ? "text-primary-foreground/70 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
                                                        onClick={handleSaveEdit}
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="break-words whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                        )}

                                        <div className={cn(
                                            "flex items-center gap-1 justify-end mt-1",
                                            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                                        )}>
                                            {msg.editedAt && (
                                                <span className="text-[9px] italic opacity-70">edited</span>
                                            )}
                                            <span className="text-[10px]">
                                                {new Date(msg._creationTime).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                            {isMe && <CheckCheck className="h-3.5 w-3.5" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Action buttons - Reply + Edit */}
                                <div className={cn(
                                    "flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity self-center",
                                    isMe ? "flex-row-reverse" : ""
                                )}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-transparent"
                                        onClick={() => setReplyingTo(msg)}
                                        title="Reply"
                                    >
                                        <Reply className="h-4 w-4" />
                                    </Button>
                                    {isMe && msg.type === "text" && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-transparent"
                                            onClick={() => handleStartEdit(msg)}
                                            title="Edit"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
            <div ref={bottomRef} className="h-1" />
        </div>
    );
}
