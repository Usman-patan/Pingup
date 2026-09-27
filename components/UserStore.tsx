"use client";

import { useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function UserStore() {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { user, isLoaded: isClerkLoaded } = useUser();
    const storeUser = useMutation(api.users.store);

    useEffect(() => {
        // Debug: log auth states to console
        console.log("[UserStore] Clerk loaded:", isClerkLoaded, "Clerk user:", !!user);
        console.log("[UserStore] Convex loading:", isLoading, "Convex authenticated:", isAuthenticated);

        if (!isAuthenticated || !user) {
            return;
        }

        const email = user.primaryEmailAddress?.emailAddress ?? "";
        const imageUrl = user.imageUrl;
        const name = user.fullName ?? user.username ?? "Anonymous";

        console.log("[UserStore] Calling storeUser with:", { email, name });
        storeUser({ email, imageUrl, name })
            .then(() => console.log("[UserStore] User stored successfully!"))
            .catch((err) => console.error("[UserStore] Failed to store user:", err));
    }, [isAuthenticated, isLoading, isClerkLoaded, user?.id, user?.fullName, user?.imageUrl, storeUser]);

    return null;
}
