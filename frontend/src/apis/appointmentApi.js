import API from "./axiosInstance";

// Create appointment
export const createAppointment = async (appointmentData) => {
  const { data } = await API.post("/appointments", appointmentData);
  return data;
};

// Get all appointments
export const getAppointments = async () => {
  const { data } = await API.get("/appointments");
  return data;
};

// Get single appointment
export const getAppointmentById = async (id) => {
  const { data } = await API.get(`/appointments/${id}`);
  return data;
};

// Update appointment
export const updateAppointment = async (id, updateData) => {
  const { data } = await API.put(`/appointments/${id}`, updateData);
  return data;
};

// Delete appointment
export const deleteAppointment = async (id) => {
  const { data } = await API.delete(`/appointments/${id}`);
  return data;
};
