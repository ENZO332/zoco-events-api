require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const bares = require("../data/bares.json");
const eventService = require("../application/eventService");
const aiService = require("../application/aiService");

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

const loadBares = async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  log("Mongo conectado");

  let agregados = 0;
  let duplicados = 0;

  for (const bar of bares) {
    //chequeo exacto por nombre para evitar duplicados obvios
    const existing = await eventService.getEventByName(bar.name);
    if (existing) {
      log(`DUPLICADO exacto: "${bar.name}" — omitido`);
      duplicados++;
      continue;
    }
    
    //chequeo semántico con IA para detectar duplicados aunque estén escritos diferente
    const todosLosNombres = (await eventService.getAllEvents()).map(e => e.name);
    const resultado = await aiService.detectarDuplicadoSemantico(bar.name, todosLosNombres);

    if (resultado?.esDuplicado) {
        log(`DUPLICADO semántico: "${bar.name}" es similar a "${resultado.coincidencia}" — omitido`);
        duplicados++;
        continue;
    }

    await eventService.createEvent({
      ...bar,
      source: "mock"
    });
    log(`AGREGADO: "${bar.name}"`);
    agregados++;
  }

  log(`Carga finalizada — Agregados: ${agregados} | Duplicados omitidos: ${duplicados}`);
  await mongoose.disconnect();
};

loadBares().catch((err) => {
  console.error("ERROR en la carga:", err);
  process.exit(1);
});