const eventService = require("../application/eventService");
const AppError = require("../utils/AppError");

const getEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) throw new AppError("Evento no encontrado", 404);
    res.json(event);
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    if (!event) throw new AppError("Evento no encontrado", 404);
    res.json(event);
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await eventService.deleteEvent(req.params.id);
    if (!event) throw new AppError("Evento no encontrado", 404);
    res.status(200).json({ message: "Evento desactivado", event });
  } catch (error) {
    next(error);
  }
};

const askAgentForEvent = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question) throw new AppError("Falta el campo 'question'", 400);
    const respuesta = await eventService.askAgent(question);
    res.json({ answer: respuesta });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent, askAgentForEvent };