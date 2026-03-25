import { Schema, model, models } from "mongoose"

const AnalyticsEventSchema = new Schema(
  {
    userId: { type: String, index: true },
    event: { type: String, required: true, index: true },
    properties: { type: Map, of: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
)

export const AnalyticsEvent =
  models.AnalyticsEvent || model("AnalyticsEvent", AnalyticsEventSchema, "analytics_events")
