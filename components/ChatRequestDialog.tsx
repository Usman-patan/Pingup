"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function ChatRequestDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const requests = useQuery(api.chatRequests.getPending);
    const acceptRequest = useMutation(api.chatRequests.accept);
    const declineRequest = useMutation(api.chatRequests.decline);
    const router = useRouter();
    const [loading, setLoading] = useState<Id<"chatRequests"> | null>(null);

    const handleAccept = async (requestId: Id<"chatRequests">) => {
        setLoading(requestId);
        try {
            const conversationId = await acceptRequest({ requestId });
            onOpenChange(false);
            router.push(`/conversations/${conversationId}`);
        } finally {
            setLoading(null);
        }
    };

    const handleDecline = async (requestId: Id<"chatRequests">) => {
        setLoading(requestId);
        try {
            await declineRequest({ requestId });
        } finally {
            setLoading(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg flex items-center gap-2">
                        Chat Requests
                        {requests && requests.length > 0 && (
                            <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
                                {requests.length}
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                    {requests === undefined && (
                        <div className="py-8 text-center text-muted-foreground text-sm">
                            Loading...
                        </div>
                    )}

                    {requests?.length === 0 && (
                        <div className="py-8 text-center text-muted-foreground text-sm">
                            No pending requests
                        </div>
                    )}

                    {requests?.map((req) => (
                        <div
                            key={req._id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 hover:bg-secondary/10 transition-colors"
                        >
                            <Avatar className="h-11 w-11 shrink-0 border border-border/30">
                                <AvatarImage src={req.senderImage} />
                                <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                                    {req.senderName?.charAt(0)?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm truncate text-foreground">
                                    {req.senderName}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                    {req.senderEmail}
                                </div>
                                {req.message && (
                                    <div className="text-xs text-muted-foreground mt-1 italic truncate">
                                        &quot;{req.message}&quot;
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 rounded-full bg-secondary/50 text-secondary-foreground hover:bg-secondary"
                                    onClick={() => handleAccept(req._id)}
                                    disabled={loading === req._id}
                                    title="Accept"
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                                    onClick={() => handleDecline(req._id)}
                                    disabled={loading === req._id}
                                    title="Decline"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
