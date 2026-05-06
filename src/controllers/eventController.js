const eventService = require("../application/eventService");

const getEvents = async (req, res) => {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ error: "Error al obtener eventos" });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });
    res.json(event);
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ error: "Error al obtener el evento" });
  }
};

const createEvent = async (req, res) => {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    console.log("ERROR:", error);
    const status = 
      error.message.includes("Ya existe") || error.message.includes("duplicado semántico") 
        ? 409 
        : 500;
    res.status(status).json({ error: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });
    res.json(event);
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ error: "Error al actualizar el evento" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await eventService.deleteEvent(req.params.id);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });
    res.status(200).json({ message: "Evento desactivado", event });
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ error: "Error al desactivar el evento" });
  }
};

const askAgentForEvent = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Falta el campo 'question'" });
    const respuesta = await eventService.askAgent(question);
    res.json({ answer: respuesta });
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ error: "Error al procesar la pregunta" });
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent, askAgentForEvent };