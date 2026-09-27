"use client";

import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
    return (
        <div className="flex-1 overflow-y-auto bg-background">
            <div className="max-w-4xl mx-auto py-8 px-4">
                <UserProfile
                    routing="hash"
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            cardBox: "w-full shadow-none",
                            card: "w-full shadow-none border border-border rounded-xl",
                        },
                    }}
                />
            </div>
        </div>
    );
}
