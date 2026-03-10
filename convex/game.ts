import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const loadGame = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const gameRecord = await ctx.db
      .query("gameData")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
      
    return gameRecord;
  },
});

export const saveGame = mutation({
  args: {
    userId: v.id("users"),
    
    // We break out the exact fields defined in schema.ts
    data: v.number(),
    totalData: v.number(),
    hp: v.number(),
    maxHp: v.number(),
    charm: v.number(),
    affection: v.number(),
    feverGauge: v.number(),
    generators: v.record(v.string(), v.number()),
    upgrades: v.array(v.string()),
    prestigeLevel: v.number(),
    prestigeCurrency: v.number(),
    prestigePerks: v.array(v.string()),
    unlockedIdols: v.array(v.string()),
    currentIdolId: v.string(),
    lastSavedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existingRecord = await ctx.db
      .query("gameData")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existingRecord) {
      // Upsert: Update existing
      await ctx.db.patch(existingRecord._id, {
        data: args.data,
        totalData: args.totalData,
        hp: args.hp,
        maxHp: args.maxHp,
        charm: args.charm,
        affection: args.affection,
        feverGauge: args.feverGauge,
        generators: args.generators,
        upgrades: args.upgrades,
        prestigeLevel: args.prestigeLevel,
        prestigeCurrency: args.prestigeCurrency,
        prestigePerks: args.prestigePerks,
        unlockedIdols: args.unlockedIdols,
        currentIdolId: args.currentIdolId,
        lastSavedAt: args.lastSavedAt,
      });
      return { success: true, savedId: existingRecord._id };
    } else {
      // Insert new
      const newId = await ctx.db.insert("gameData", {
        userId: args.userId,
        data: args.data,
        totalData: args.totalData,
        hp: args.hp,
        maxHp: args.maxHp,
        charm: args.charm,
        affection: args.affection,
        feverGauge: args.feverGauge,
        generators: args.generators,
        upgrades: args.upgrades,
        prestigeLevel: args.prestigeLevel,
        prestigeCurrency: args.prestigeCurrency,
        prestigePerks: args.prestigePerks,
        unlockedIdols: args.unlockedIdols,
        currentIdolId: args.currentIdolId,
        lastSavedAt: args.lastSavedAt,
      });
      return { success: true, savedId: newId };
    }
  },
});
