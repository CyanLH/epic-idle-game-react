import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const storeUser = mutation({
  args: { 
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser !== null) {
      return existingUser._id;
    }

    const newUserId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      image: args.image,
    });
    
    return newUserId;
  },
});
