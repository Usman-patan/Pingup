import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createConversation = mutation({
    args: {
        participantId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        // Check if 1-1 conversation already exists
        const existingConversations = await ctx.db
            .query("conversationMembers")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        for (const member of existingConversations) {
            const conversation = await ctx.db.get(member.conversationId);
            if (conversation && !conversation.isGroup) {
                const otherMember = await ctx.db
                    .query("conversationMembers")
                    .withIndex("by_conversationId_userId", (q) =>
                        q.eq("conversationId", conversation._id).eq("userId", args.participantId)
                    )
                    .unique();

                if (otherMember) {
                    return conversation._id;
                }
            }
        }

        const conversationId = await ctx.db.insert("conversations", {
            isGroup: false,
        });

        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: user._id,
            role: "admin",
        });

        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: args.participantId,
            role: "member",
        });

        return conversationId;
    },
});

export const createGroup = mutation({
    args: {
        name: v.string(),
        memberIds: v.array(v.id("users")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const conversationId = await ctx.db.insert("conversations", {
            isGroup: true,
            name: args.name,
            adminId: user._id,
        });

        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: user._id,
            role: "admin",
        });

        for (const memberId of args.memberIds) {
            await ctx.db.insert("conversationMembers", {
                conversationId,
                userId: memberId,
                role: "member",
            });
        }

        return conversationId;
    },
});

export const getMyConversations = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return [];

        const members = await ctx.db
            .query("conversationMembers")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        const conversations = [];
        for (const member of members) {
            const conversation = await ctx.db.get(member.conversationId);
            if (!conversation) continue;

            let otherMemberConfig = null;
            if (!conversation.isGroup) {
                const otherMembers = await ctx.db
                    .query("conversationMembers")
                    .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
                    .collect();

                const otherMemberRelation = otherMembers.find((m) => m.userId !== user._id);
                if (otherMemberRelation) {
                    const otherUser = await ctx.db.get(otherMemberRelation.userId);
                    otherMemberConfig = otherUser;
                }
            }

            conversations.push({
                ...conversation,
                otherMember: otherMemberConfig,
            });
        }

        return conversations.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
    },
});

export const getConversation = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db.get(args.conversationId);
    },
});

export const getMembers = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const members = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        const membersWithUser = await Promise.all(
            members.map(async (member) => {
                const user = await ctx.db.get(member.userId);
                return {
                    ...member,
                    user,
                };
            })
        );

        return membersWithUser;
    },
});

export const removeMember = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        // Check if current user is admin
        const currentMember = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId_userId", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", currentUser._id)
            )
            .unique();

        if (!currentMember || currentMember.role !== "admin") {
            throw new Error("Only admins can remove members");
        }

        const memberToRemove = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId_userId", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", args.userId)
            )
            .unique();

        if (memberToRemove) {
            await ctx.db.delete(memberToRemove._id);
        }
    },
});

export const leaveGroup = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const member = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId_userId", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", user._id)
            )
            .unique();

        if (member) {
            await ctx.db.delete(member._id);
        }
    },
});

export const deleteGroup = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw new Error("Conversation not found");
        if (conversation.adminId !== user._id) throw new Error("Only admin can delete");

        // Delete all members
        const members = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        for (const member of members) {
            await ctx.db.delete(member._id);
        }

        // Delete all messages
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        for (const message of messages) {
            await ctx.db.delete(message._id);
        }

        // Delete conversation
        await ctx.db.delete(args.conversationId);
    },
});

export const updateGroup = mutation({
    args: {
        conversationId: v.id("conversations"),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw new Error("Conversation not found");
        if (conversation.adminId !== user._id) throw new Error("Only admin can update");

        const updates: Record<string, unknown> = {};
        if (args.name !== undefined) updates.name = args.name;

        await ctx.db.patch(args.conversationId, updates);
    },
});

export const addMembers = mutation({
    args: {
        conversationId: v.id("conversations"),
        userIds: v.array(v.id("users")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        // Verify admin
        const currentMember = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId_userId", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", user._id)
            )
            .unique();

        if (!currentMember || currentMember.role !== "admin") {
            throw new Error("Only admins can add members");
        }

        for (const userId of args.userIds) {
            // Check if already a member
            const existing = await ctx.db
                .query("conversationMembers")
                .withIndex("by_conversationId_userId", (q) =>
                    q.eq("conversationId", args.conversationId).eq("userId", userId)
                )
                .unique();

            if (!existing) {
                await ctx.db.insert("conversationMembers", {
                    conversationId: args.conversationId,
                    userId,
                    role: "member",
                });
            }
        }
    },
});
