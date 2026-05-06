const eventRepository = require("../infrastructure/eventRepository");
const aiService = require("./aiService");

const getAllEvents = () => eventRepository.findAll();

const getEventById = (id) => eventRepository.findById(id);

const getEventByName = (name) => eventRepository.findByName(name);

const createEvent = async (data) => {
  const eventName = data.name;

  const allEvents = await getAllEvents();
  const allNames = allEvents.map(e => e.name);

  //duplicado exacto
  const exacto = allNames.some(
    n => n.toLowerCase() === eventName.toLowerCase()
  );
  if (exacto) throw new Error("Ya existe un evento con ese nombre");

  //duplicado semántico
  const resultado = await aiService.detectarDuplicadoSemantico(eventName, allNames);
  if (resultado?.esDuplicado) {
    throw new Error(`Posible duplicado semántico con '${resultado.coincidencia}'`);
  }

  let locationName = data.location;

   // normalizar dirección con IA
  const locationNormalizada = locationName;

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

module.exports = { getAllEvents, getEventById, getEventByName, createEvent, updateEvent, deleteEvent };