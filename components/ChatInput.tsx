"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip, X } from "lucide-react";

type ChatInputProps = {
    conversationId: Id<"conversations">;
    replyingTo: any | null;
    setReplyingTo: (msg: any | null) => void;
};

export default function ChatInput({ conversationId, replyingTo, setReplyingTo }: ChatInputProps) {
    const [content, setContent] = useState("");
    const send = useMutation(api.messages.send);
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!content.trim() || sending) return;
        setSending(true);
        try {
            await send({
                conversationId,
                content,
                type: "text",
                parentMessageId: replyingTo?._id,
            });
            setContent("");
            setReplyingTo(null);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-background border-t border-border/50 flex flex-col">
            {replyingTo && (
                <div className="px-4 py-2 bg-secondary/30 flex items-center justify-between border-b border-border/50 text-xs">
                    <div className="flex flex-col gap-0.5 max-w-[90%]">
                        <span className="font-semibold text-primary">Replying to {replyingTo.senderName}</span>
                        <span className="text-muted-foreground truncate">{replyingTo.content}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => setReplyingTo(null)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            <div className="px-4 py-3 flex items-end gap-2">
                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={replyingTo ? "Type your reply..." : "Type a message"}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        disabled={sending}
                        rows={1}
                        className="w-full resize-none rounded-xl bg-card border border-border/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground shadow-sm max-h-32 overflow-y-auto text-foreground"
                        style={{ minHeight: "40px" }}
                    />
                </div>

                <Button
                    onClick={handleSend}
                    size="icon"
                    disabled={sending || !content.trim()}
                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-10 shrink-0 shadow-md disabled:opacity-50 transition-all hover:scale-105"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
