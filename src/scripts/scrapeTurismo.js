const axios = require("axios");
const cheerio = require("cheerio");
const eventService = require("../application/eventService");
const aiService = require("../application/aiService");

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

const URL = "https://www.tucumanturismo.gob.ar/articulos/articulo/174/bares-y-restaurantes";

const scrapeBares = async () => {
  const response = await axios.get(URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; ZocoEventsBot/1.0)"
    },
    timeout: 15000
  });

  const $ = cheerio.load(response.data);
  const bares = [];

  // cada bar está en un párrafo con un <strong> como nombre
  $("strong").each((i, el) => {
    const nombre = $(el).text().trim();
    if (!nombre) return;

    // el siguiente texto del párrafo tiene la dirección
    const parrafo = $(el).parent();
    
    console.log("HTML:", parrafo.parent().html()?.substring(0, 500));
    const textoCompleto = parrafo.text();
    console.log("TEXTO:", JSON.stringify(textoCompleto.substring(0, 200)));

    // extraer dirección
    const dirMatch = textoCompleto.match(/Direcci[oó]n:\s*([^|]+?)(?=\s*Direcci[oó]n:|Localidad:|Horarios|Contacto|$)/);
    const direccion = dirMatch ? dirMatch[1].trim() : "Tucumán";

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