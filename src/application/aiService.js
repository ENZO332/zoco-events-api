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

module.exports = { detectarDuplicadoSemantico, normalizarDireccion };