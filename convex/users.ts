import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const store = mutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication present");
        }

        // Check if we've already stored this identity before.
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (user !== null) {
            // If we've seen this identity before but the name has changed, patch the value.
            if (user.name !== args.name || user.imageUrl !== args.imageUrl) {
                await ctx.db.patch(user._id, { name: args.name, imageUrl: args.imageUrl });
            }
            return user._id;
        }

        // If it's a new identity, create a new `User`.
        return await ctx.db.insert("users", {
            clerkId: identity.subject,
            email: args.email,
            name: args.name,
            imageUrl: args.imageUrl,
        });
    },
});

export const search = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        if (!args.query) return [];

        // Exact email search
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.query))
            .unique();

        if (!user) return [];

        // Don't result self
        if (user.clerkId === identity.subject) return [];

        return [user];
    }
});

export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }
        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
    }
});
