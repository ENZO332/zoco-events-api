require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const axios = require("axios");
const eventService = require("../application/eventService");

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

const fetchBaresTucuman = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));

  const query = `
    [out:json][timeout:25];
    area[name="San Miguel de Tucumán"]->.searchArea;
    (
      node["amenity"="bar"](area.searchArea);
      node["amenity"="pub"](area.searchArea);
      node["amenity"="nightclub"](area.searchArea);
      node["amenity"="cafe"](area.searchArea);
      node["amenity"="restaurant"](area.searchArea);
    );
    out body;
  `;

    const response = await axios.post(
        "https://overpass.kumi.systems/api/interpreter",
        `data=${encodeURIComponent(query)}`,
        { 
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            timeout: 30000
        }
    );

  return response.data.elements;
};

const categoryMap = {
  bar: "bar",
  pub: "bar",
  nightclub: "boliche",
  cafe: "café",
  restaurant: "restorán"
};

const loadFromOSM = async () => {
  log("Iniciando carga desde OSM...");

  const elementos = await fetchBaresTucuman();
  log(`Obtenidos ${elementos.length} lugares desde OpenStreetMap`);

  let agregados = 0;
  let duplicados = 0;
  let sinNombre = 0;

  for (const el of elementos) {
    const nombre = el.tags?.name;
    if (!nombre) {
      sinNombre++;
      continue;
    }

    const direccion = el.tags?.["addr:street"]
      ? `${el.tags["addr:street"]} ${el.tags["addr:housenumber"] || ""}`.trim()
      : "Tucumán";

    const categoria = categoryMap[el.tags?.amenity] || "bar";

    try {
      await eventService.createEvent({
        name: nombre,
        location: direccion,
        category: categoria,
        source: "osm"
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

  const resumen = `Finalizado — Agregados: ${agregados} | Duplicados: ${duplicados} | Sin nombre: ${sinNombre}`;
  log(resumen);
  return { agregados, duplicados, sinNombre };
};

module.exports = { loadFromOSM };