import mongoose from "mongoose";

export const openDB = async () => {
  try {
    // Menghubungkan ke database MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected...");

    // Event listener untuk koneksi yang berhasil
    mongoose.connection.on("connected", () => {
      console.log("Mongoose connected to the database...");
    });

    // Event listener untuk error koneksi
    mongoose.connection.on("error", (err) => {
      console.error(`Mongoose connection error: ${err.message}`);
    });

    // Event listener untuk koneksi yang terputus
    mongoose.connection.on("disconnected", () => {
      console.warn("Mongoose connection is disconnected...");
    });

    // Tangani SIGINT (aplikasi berhenti)
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log(
        "Mongoose connection is disconnected due to app termination..."
      );
      process.exit(0);
    });
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1); // Keluar dari aplikasi jika gagal terhubung ke MongoDB
  }
};
