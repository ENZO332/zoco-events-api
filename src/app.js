require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const eventRoutes = require("./routes/eventRoutes");

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log("Mongo conectado"))
.catch(err => console.log("ERROR MONGO:", err));

app.get("/", (req, res) => res.send("API funcionando"));
app.use("/events", eventRoutes);

app.use((err, req, res, next) => {
  console.log(`[ERROR] ${err.status || 500} - ${err.message}`);
  res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor en puerto 3000");
});