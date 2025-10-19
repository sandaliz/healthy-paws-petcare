import API from "./axiosInstance";

// Create event
export const createEvent = async (eventData) => {
  const { data } = await API.post("/events", eventData);
  return data;
};

// Get all events
export const getEvents = async () => {
  const { data } = await API.get("/events");
  return data;
};

// Get single event
export const getEventById = async (id) => {
  const { data } = await API.get(`/events/${id}`);
  return data;
};

// Update event
export const updateEvent = async (id, updateData) => {
  const { data } = await API.put(`/events/${id}`, updateData);
  return data;
};

// Delete event
export const deleteEvent = async (id) => {
  const { data } = await API.delete(`/events/${id}`);
  return data;
};
