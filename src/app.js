require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const eventRoutes = require("./routes/eventRoutes");
const cors = require("cors");

const app = express();

app.use(cors());
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

app.post("/admin/scrape-turismo", async (req, res) => {
  try {
    const { loadFromScraping } = require("./scripts/scrapeTurismo");
    const resultado = await loadFromScraping();
    res.json({ message: "Scraping completado", ...resultado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor en puerto ${PORT}`);
});