const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.1-8b-instant";

const detectarDuplicadoSemantico = async (nombreNuevo, nombresExistentes) => {
    if (nombresExistentes.length === 0) return null;

    const prompt = `
Tenés una base de datos de bares y eventos de Tucumán, Argentina.
Estás por agregar un nuevo lugar llamado: "${nombreNuevo}"

Estos son los nombres que ya existen en la base:
${nombresExistentes.map((n, i) => `${i + 1}. ${n}`).join("\n")}

¿Alguno de los nombres existentes es el mismo lugar que "${nombreNuevo}", aunque esté escrito diferente?
Respondé SOLO con un JSON con este formato, sin texto adicional ni backticks:
{
  "esDuplicado": true o false,
  "coincidencia": "nombre exacto del duplicado si existe, o null"
}
`;

    const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0
    });

    const texto = response.choices[0].message.content.trim();
    return JSON.parse(texto.replace(/```json|```/g, ""));
};

const normalizarDireccion = async (direccion) => {
    const prompt = `
Normalizá esta dirección de Tucumán, Argentina.
Respondé SOLO con la dirección normalizada.

Dirección:
"${direccion}"
`;

    const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0
    });

    return response.choices[0].message.content.trim();
};

const responderPregunta = async (pregunta, eventos) => {
    const contexto = eventos.map(e => 
        `- ${e.name} | ${e.category} | ${e.location}`
    ).join("\n");

    const prompt = `
Sos un asistente que conoce los bares y eventos de Tucumán, Argentina.
Estos son los lugares disponibles en la base de datos:
${contexto}

Respondé esta pregunta en español de forma clara y concisa:
"${pregunta}"

Si la pregunta no tiene relación con los datos, respondé que solo tenés información sobre bares y eventos de Tucumán.
`;

    const response = await groq.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
    });

    return response.choices[0].message.content.trim();
};

module.exports = { detectarDuplicadoSemantico, normalizarDireccion, responderPregunta };