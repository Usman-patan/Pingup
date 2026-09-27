import { MessageCircle } from "lucide-react";

export default function EmptyState() {
    return (
        <div className="h-full flex items-center justify-center bg-background">
            <div className="text-center px-6">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">PingUp Web</h3>
                <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Send and receive messages in real-time. Select a conversation from the sidebar or start a new one.
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 0 0-8 0v4h8Z" />
                    </svg>
                    End-to-end encrypted
                </div>
            </div>
        </div>
    );
}
