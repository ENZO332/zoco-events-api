const axios = require("axios");
const eventService = require("../application/eventService");

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

const categoryMap = {
  "13003": "bar",
  "13059": "bar", 
  "13006": "boliche",
  "13032": "café",
  "13065": "restorán"
};

const fetchBaresTucuman = async () => {
  const response = await axios.get("https://api.foursquare.com/v3/places/search", {
    headers: {
      Authorization: process.env.FOURSQUARE_API_KEY,
      Accept: "application/json"
    },
    params: {
      query: "bar",
      near: "San Miguel de Tucumán, Argentina",
      limit: 50,
      categories: "13003,13059,13006,13032,13065"
    }
  });

  return response.data.results;
};

const loadFromOSM = async () => {
  log("Iniciando carga desde Foursquare...");

  const lugares = await fetchBaresTucuman();
  log(`Obtenidos ${lugares.length} lugares desde Foursquare`);

  let agregados = 0;
  let duplicados = 0;

  for (const lugar of lugares) {
    const nombre = lugar.name;
    const direccion = lugar.location?.formatted_address || "Tucumán";
    const categoriaId = lugar.categories?.[0]?.id?.toString();
    const categoria = categoryMap[categoriaId] || "bar";

    try {
      await eventService.createEvent({
        name: nombre,
        location: direccion,
        category: categoria,
        source: "foursquare"
      });
      log(`AGREGADO: "${nombre}"`);
      agregados++;
    } catch (error) {
      if (error.message.includes("Ya existe") || error.message.includes("duplicado")) {
        log(`DUPLICADO: "${nombre}" — omitido`);
        duplicados++;
      } else {
        log(`ERROR con "${nombre}": ${error.message}`);
      }
    }
  }

  const resumen = `Finalizado — Agregados: ${agregados} | Duplicados: ${duplicados}`;
  log(resumen);
  return { agregados, duplicados };
};

module.exports = { loadFromOSM };