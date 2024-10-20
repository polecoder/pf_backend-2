import { model, Schema } from "mongoose";

const cartSchema = new Schema({
  products: {
    type: [
      {
        product: { type: Schema.Types.ObjectId, ref: "products" },
        quantity: { type: Number, required: true },
      },
    ],
    default: [],
  },
});

export const cartsModel = model("carts", cartSchema);
