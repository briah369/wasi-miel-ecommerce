import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    descripcion: {
      type: String,
      required: true,
    },
    precio: {
      type: Number,
      required: true,
    },
    categoria: {
      type: mongoose.ObjectId,
      ref: "Categorias",
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
    },
    foto: {
      data: Buffer,
      contentType: String,
    },
    envio: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Productos", productSchema);
