import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    image: v.optional(v.string()),
  }).index("by_email", ["email"]),

  gameData: defineTable({
    userId: v.id("users"),
    
    // Core stats
    data: v.number(),
    totalData: v.number(),
    hp: v.number(),
    maxHp: v.number(),
    charm: v.number(),
    affection: v.number(),
    feverGauge: v.number(),
    
    // Inventory and Purchases
    generators: v.record(v.string(), v.number()),
    upgrades: v.array(v.string()),
    
    // Prestige System
    prestigeLevel: v.number(),
    prestigeCurrency: v.number(),
    prestigePerks: v.array(v.string()),
    unlockedIdols: v.array(v.string()),
    currentIdolId: v.string(),
    
    // Server validation metadata
    lastSavedAt: v.number(),
  }).index("by_userId", ["userId"])
});
