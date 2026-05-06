const Event = require("../models/Event");

const findAll = () => Event.find({ isActive: true });

const findById = (id) => Event.findById(id);

const findByName = (name) => 
    Event.findOne({ name: { $regex: `^${name}$`, $options: "i" } });

const create = (data) => Event.create(data);

const update = (id, data) => Event.findByIdAndUpdate(id, data, { new: true });

const deactivate = (id) => Event.findByIdAndUpdate(id, { isActive: false }, { new: true });

module.exports = { findAll, findById, findByName, create, update, deactivate };