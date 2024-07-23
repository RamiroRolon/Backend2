import { Schema, model } from "mongoose";

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: [{ product: String, quantity: Number, price: Number }],
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export const orderModel = model("Order", orderSchema);
