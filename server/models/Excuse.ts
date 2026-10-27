import mongoose, { Schema, Document } from "mongoose";

export interface IExcuse extends Document {
  text: string;
  score: number;
  category: string;
  author: string;
  saves: number;
  rating?: string;
  verdict?: string;
  creativity?: number;
  originality?: number;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExcuseSchema: Schema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    category: { type: String, required: true, default: "General" },
    author: { type: String, required: true, default: "Anonymous" },
    saves: { type: Number, default: 0 },
    rating: { type: String, default: "4.5" },
    verdict: { type: String, default: "Plausible" },
    creativity: { type: Number, default: 80 },
    originality: { type: Number, default: 75 },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Excuse = mongoose.model<IExcuse>("Excuse", ExcuseSchema);
