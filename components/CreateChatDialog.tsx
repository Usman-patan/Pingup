"use client";

import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquarePlus, Send, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export default function CreateChatDialog() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [sentTo, setSentTo] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const users = useQuery(api.users.search, { query: search });
    const sendRequest = useMutation(api.chatRequests.send);
    const router = useRouter();

    const handleSendRequest = async (userId: Id<"users">) => {
        setError(null);
        try {
            const result = await sendRequest({ receiverId: userId });
            if (result.status === "auto_accepted") {
                // The other user already sent us a request — auto-accepted, go to convo
                setOpen(false);
                setSearch("");
                router.push(`/conversations/${result.conversationId}`);
            } else {
                // Request sent successfully
                setSentTo((prev) => new Set(prev).add(userId));
            }
        } catch (err: any) {
            if (err.message?.includes("Already connected")) {
                setError("You already have a chat with this user.");
            } else if (err.message?.includes("Request already sent")) {
                setSentTo((prev) => new Set(prev).add(userId));
                setError("Request already sent to this user.");
            } else {
                setError(err.message || "Something went wrong");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSearch(""); setSentTo(new Set()); setError(null); } }}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="New Chat" className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
                    <MessageSquarePlus className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg">Send Chat Request</DialogTitle>
                </DialogHeader>
                <p className="text-xs text-muted-foreground -mt-1">
                    Search for a user by their exact email to start a conversation.
                </p>
                <Input
                    placeholder="Search by exact email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setError(null); }}
                    className="mt-1"
                    autoFocus
                />
                {error && (
                    <div className="text-xs text-red-500 px-1">{error}</div>
                )}
                <div className="flex flex-col gap-1 mt-1 max-h-72 overflow-y-auto">
                    {users?.map((user) => {
                        const alreadySent = sentTo.has(user._id);
                        return (
                            <div
                                key={user._id}
                                className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 hover:bg-secondary/20 transition-colors"
                            >
                                <Avatar className="h-10 w-10 shrink-0 border border-border/30">
                                    <AvatarImage src={user.imageUrl} />
                                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                                        {user.name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate text-foreground">{user.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                                </div>
                                <Button
                                    size="sm"
                                    disabled={alreadySent}
                                    className={
                                        alreadySent
                                            ? "bg-secondary text-muted-foreground pointer-events-none"
                                            : "bg-primary hover:bg-primary/90 text-primary-foreground"
                                    }
                                    onClick={() => handleSendRequest(user._id)}
                                >
                                    {alreadySent ? (
                                        <><Check className="h-3.5 w-3.5 mr-1" /> Sent</>
                                    ) : (
                                        <><Send className="h-3.5 w-3.5 mr-1" /> Request</>
                                    )}
                                </Button>
                            </div>
                        );
                    })}
                    {users?.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                            No users found
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
