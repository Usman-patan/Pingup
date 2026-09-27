import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    lastSeen: v.optional(v.number()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  conversations: defineTable({
    isGroup: v.boolean(),
    name: v.optional(v.string()),
    groupImage: v.optional(v.string()),
    adminId: v.optional(v.id("users")),
    lastMessageId: v.optional(v.id("messages")),
    lastMessageTime: v.optional(v.number()),
    lastMessageText: v.optional(v.string()),
  }),

  conversationMembers: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    role: v.optional(v.union(v.literal("admin"), v.literal("member"))),
    lastSeenMessageId: v.optional(v.id("messages")),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_userId", ["userId"])
    .index("by_conversationId_userId", ["conversationId", "userId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
    fileId: v.optional(v.id("_storage")),
    parentMessageId: v.optional(v.id("messages")),
    editedAt: v.optional(v.number()),
  })
    .index("by_conversationId", ["conversationId"]),

  chatRequests: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
    message: v.optional(v.string()),
  })
    .index("by_receiverId", ["receiverId"])
    .index("by_senderId", ["senderId"])
    .index("by_senderId_receiverId", ["senderId", "receiverId"]),
});
