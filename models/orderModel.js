import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    productos: [
      {
        type: mongoose.ObjectId,
        ref: "Productos",
      },
    ],
    pago: {},
    comprador: {
      type: mongoose.ObjectId,
      ref: "usuarios",
    },
    estado: {
      type: String,
      default: "No Procesado",
      enum: ["No Procesado", "Procesado", "Enviado", "Entregado", "Cancelado"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Ordenes", orderSchema);
