const eventRepository = require("../infrastructure/eventRepository");
const aiService = require("./aiService");
const AppError = require("../utils/AppError");

const getAllEvents = () => eventRepository.findAll();

const getEventById = (id) => eventRepository.findById(id);

const getEventByName = (name) => eventRepository.findByName(name);

const createEvent = async (data) => {
  if (!data.name?.trim()) throw new AppError("El nombre es obligatorio", 400);
  if (!data.location?.trim()) throw new AppError("La dirección es obligatoria", 400);

  const eventName = data.name;

  const allEvents = await getAllEvents();
  const allNames = allEvents.map(e => e.name);

  //duplicado exacto
  const exacto = allNames.some(
    n => n.toLowerCase() === eventName.toLowerCase()
  );
  if (exacto) throw new AppError("Ya existe un evento con ese nombre", 409);

  //duplicado semántico
  const resultado = await aiService.detectarDuplicadoSemantico(eventName, allNames);
  if (resultado?.esDuplicado) {
    throw new AppError(`Posible duplicado semántico con '${resultado.coincidencia}'`, 409);
  }

  const locationName = data.location;

   // normalizar dirección con IA
  let locationNormalizada = locationName;

  try {
    if (locationName) {
      locationNormalizada = await aiService.normalizarDireccion(locationName);
    }
  } catch (error) {
    console.log("No se pudo normalizar la dirección");
  }

  return eventRepository.create({
    ...data,
    location: locationNormalizada,
    fetchedAt: new Date(),
    source: data.source || "manual"
  });
};

const updateEvent = (id, data) => eventRepository.update(id, data);

const deleteEvent = (id) => eventRepository.deactivate(id);

const askAgent = async (ask) => {
  const events = await getAllEvents();
  return aiService.responderPregunta(ask, events);
};

module.exports = { getAllEvents, getEventById, getEventByName, createEvent, updateEvent, deleteEvent, askAgent };