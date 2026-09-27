import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
        type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
        parentMessageId: v.optional(v.id("messages")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        // Verify membership
        const member = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId_userId", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", user._id)
            )
            .unique();

        if (!member) throw new Error("You are not a member of this conversation");

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: user._id,
            content: args.content,
            type: args.type,
            parentMessageId: args.parentMessageId,
        });

        // Update conversation last message info
        await ctx.db.patch(args.conversationId, {
            lastMessageId: messageId,
            lastMessageTime: Date.now(),
            lastMessageText: args.content.length > 50 ? args.content.slice(0, 50) + "…" : args.content,
        });
    },
});

export const edit = mutation({
    args: {
        messageId: v.id("messages"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        // Only the sender can edit their own message
        if (message.senderId !== user._id) {
            throw new Error("You can only edit your own messages");
        }

        // Only text messages can be edited
        if (message.type !== "text") {
            throw new Error("Only text messages can be edited");
        }

        await ctx.db.patch(args.messageId, {
            content: args.content,
            editedAt: Date.now(),
        });

        // Update conversation last message if this was the latest
        const conversation = await ctx.db.get(message.conversationId);
        if (conversation && conversation.lastMessageId === args.messageId) {
            await ctx.db.patch(message.conversationId, {
                lastMessageText: args.content.length > 50 ? args.content.slice(0, 50) + "…" : args.content,
            });
        }
    },
});

export const list = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .order("asc")
            .collect();

        // Enrich with sender info and parent message info
        const messagesWithDetails = await Promise.all(
            messages.map(async (msg) => {
                const sender = await ctx.db.get(msg.senderId);
                let parentMessage = null;
                let parentSender = null;

                if (msg.parentMessageId) {
                    parentMessage = await ctx.db.get(msg.parentMessageId);
                    if (parentMessage) {
                        parentSender = await ctx.db.get(parentMessage.senderId);
                    }
                }

                return {
                    ...msg,
                    senderName: sender?.name,
                    senderImage: sender?.imageUrl,
                    parentMessageContent: parentMessage?.content,
                    parentMessageSender: parentSender?.name,
                };
            })
        );

        return messagesWithDetails;
    },
});
