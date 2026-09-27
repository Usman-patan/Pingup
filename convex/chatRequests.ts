import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Send a chat request to another user
export const send = mutation({
    args: {
        receiverId: v.id("users"),
        message: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) throw new Error("User not found");

        if (user._id === args.receiverId) {
            throw new Error("Cannot send request to yourself");
        }

        // Check if a request already exists between these users (in either direction)
        const existingSent = await ctx.db
            .query("chatRequests")
            .withIndex("by_senderId_receiverId", (q) =>
                q.eq("senderId", user._id).eq("receiverId", args.receiverId)
            )
            .collect();

        const pendingOrAccepted = existingSent.find(
            (r) => r.status === "pending" || r.status === "accepted"
        );
        if (pendingOrAccepted) {
            throw new Error(
                pendingOrAccepted.status === "pending"
                    ? "Request already sent"
                    : "Already connected"
            );
        }

        // Check if the other user already sent us a request
        const existingReceived = await ctx.db
            .query("chatRequests")
            .withIndex("by_senderId_receiverId", (q) =>
                q.eq("senderId", args.receiverId).eq("receiverId", user._id)
            )
            .collect();

        const pendingFromThem = existingReceived.find((r) => r.status === "pending");
        if (pendingFromThem) {
            // Auto-accept if they already sent us one
            await ctx.db.patch(pendingFromThem._id, { status: "accepted" });
            // Create conversation
            const conversationId = await ctx.db.insert("conversations", { isGroup: false });
            await ctx.db.insert("conversationMembers", {
                conversationId,
                userId: user._id,
                role: "admin",
            });
            await ctx.db.insert("conversationMembers", {
                conversationId,
                userId: args.receiverId,
                role: "member",
            });
            return { status: "auto_accepted", conversationId };
        }

        // Check if there's already a conversation between them
        const myMemberships = await ctx.db
            .query("conversationMembers")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        for (const m of myMemberships) {
            const conv = await ctx.db.get(m.conversationId);
            if (conv && !conv.isGroup) {
                const otherMember = await ctx.db
                    .query("conversationMembers")
                    .withIndex("by_conversationId_userId", (q) =>
                        q.eq("conversationId", conv._id).eq("userId", args.receiverId)
                    )
                    .unique();
                if (otherMember) {
                    throw new Error("Already connected");
                }
            }
        }

        await ctx.db.insert("chatRequests", {
            senderId: user._id,
            receiverId: args.receiverId,
            status: "pending",
            message: args.message,
        });

        return { status: "sent" };
    },
});

// Accept a chat request → create conversation
export const accept = mutation({
    args: { requestId: v.id("chatRequests") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) throw new Error("User not found");

        const request = await ctx.db.get(args.requestId);
        if (!request) throw new Error("Request not found");
        if (request.receiverId !== user._id) throw new Error("Not your request");
        if (request.status !== "pending") throw new Error("Request already handled");

        await ctx.db.patch(args.requestId, { status: "accepted" });

        // Create 1-1 conversation
        const conversationId = await ctx.db.insert("conversations", { isGroup: false });
        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: request.senderId,
            role: "member",
        });
        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: user._id,
            role: "member",
        });

        return conversationId;
    },
});

// Decline a chat request
export const decline = mutation({
    args: { requestId: v.id("chatRequests") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) throw new Error("User not found");

        const request = await ctx.db.get(args.requestId);
        if (!request) throw new Error("Request not found");
        if (request.receiverId !== user._id) throw new Error("Not your request");
        if (request.status !== "pending") throw new Error("Request already handled");

        await ctx.db.patch(args.requestId, { status: "declined" });
    },
});

// Get pending requests received by current user
export const getPending = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) return [];

        const requests = await ctx.db
            .query("chatRequests")
            .withIndex("by_receiverId", (q) => q.eq("receiverId", user._id))
            .collect();

        const pending = requests.filter((r) => r.status === "pending");

        // Enrich with sender info
        const enriched = await Promise.all(
            pending.map(async (req) => {
                const sender = await ctx.db.get(req.senderId);
                return {
                    ...req,
                    senderName: sender?.name,
                    senderEmail: sender?.email,
                    senderImage: sender?.imageUrl,
                };
            })
        );

        return enriched;
    },
});

// Get count of pending requests (for badge)
export const getPendingCount = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return 0;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) return 0;

        const requests = await ctx.db
            .query("chatRequests")
            .withIndex("by_receiverId", (q) => q.eq("receiverId", user._id))
            .collect();

        return requests.filter((r) => r.status === "pending").length;
    },
});
