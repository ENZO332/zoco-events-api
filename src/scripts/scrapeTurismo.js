const axios = require("axios");
const cheerio = require("cheerio");
const eventService = require("../application/eventService");
const aiService = require("../application/aiService");

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

const URL = "https://www.tucumanturismo.gob.ar/articulos/articulo/174/bares-y-restaurantes";

const scrapeBares = async () => {
  const response = await axios.get(URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ZocoEventsBot/1.0)" },
    timeout: 15000
  });

  const $ = cheerio.load(response.data);
  const bares = [];

  $("strong").each((i, el) => {
    const nombre = $(el).text().trim();
    if (!nombre) return;

    // buscar el primer <p> siguiente que contenga "Dirección:"
    let direccion = "Tucumán";
    let siguiente = $(el).parent().next("p");

    while (siguiente.length) {
      const texto = siguiente.text().trim();
      if (texto.startsWith("Dirección:")) {
        direccion = texto.replace("Dirección:", "").trim();
        break;
      }
      if (texto.startsWith("Localidad:") || texto.startsWith("Horarios")) break;
      siguiente = siguiente.next("p");
    }

    bares.push({ nombre, direccion });
  });

  return bares;
};

const loadFromScraping = async () => {
  log("Iniciando scraping desde Tucumán Turismo...");

  const bares = await scrapeBares();
  log(`Encontrados ${bares.length} lugares`);

  let agregados = 0;
  let duplicados = 0;

  for (const bar of bares) {
    try {
      const categoria = await aiService.clasificarLugar(bar.nombre);
      await eventService.createEvent({
        name: bar.nombre,
        location: bar.direccion,
        category: categoria,
        source: "tucumanturismo"
      });
      log(`AGREGADO: "${bar.nombre}"`);
      agregados++;
    } catch (error) {
      if (error.message.includes("Ya existe") || error.message.includes("duplicado")) {
        log(`DUPLICADO: "${bar.nombre}" — omitido`);
        duplicados++;
      } else {
        log(`ERROR con "${bar.nombre}": ${error.message}`);
      }
    }
  }

  log(`Finalizado — Agregados: ${agregados} | Duplicados: ${duplicados}`);
  return { agregados, duplicados };
};

module.exports = { loadFromScraping };