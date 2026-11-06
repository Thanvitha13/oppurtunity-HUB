import mongoose, { Schema, models } from "mongoose";

/** The four categories of opportunities this platform tracks. */
export const OPPORTUNITY_TYPES = ["Internship", "Hackathon", "Scholarship", "Event"] as const;
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export interface OpportunityDoc {
  _id: string;
  title: string;
  organisation: string;
  type: OpportunityType;
  description: string;
  link: string;
  deadline: string;
  createdAt: string;
}

const opportunitySchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    organisation: { type: String, required: true, trim: true, maxlength: 80 },
    type: { type: String, required: true, enum: [...OPPORTUNITY_TYPES] },
    description: { type: String, required: true, trim: true, maxlength: 600 },
    link: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);

// Reuse the model across hot reloads (standard Next.js pattern).
export const Opportunity =
  (models.Opportunity as mongoose.Model<OpportunityDoc>) ||
  mongoose.model<OpportunityDoc>("Opportunity", opportunitySchema);
