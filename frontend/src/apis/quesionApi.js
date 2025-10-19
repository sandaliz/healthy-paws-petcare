import API from "./axiosInstance";

// Create question
export const createQuestion = async (questionData) => {
  const { data } = await API.post("/questions", questionData);
  return data;
};

// Get all questions
export const getQuestions = async () => {
  const { data } = await API.get("/questions");
  return data;
};

// Get my questions
export const getMyQuestions = async () => {
  const { data } = await API.get("/questions/my");
  return data;
};

// Get questions by user ID
export const getQuestionsByUser = async (userId) => {
  const { data } = await API.get(`/questions/user/${userId}`);
  return data;
};

// Get single question
export const getQuestionById = async (id) => {
  const { data } = await API.get(`/questions/${id}`);
  return data;
};

// Update question
export const updateQuestion = async (id, updateData) => {
  const { data } = await API.put(`/questions/${id}`, updateData);
  return data;
};

// Answer question
export const answerQuestion = async (id, answer) => {
  const { data } = await API.put(`/questions/${id}`, { answer });
  return data;
};

// Delete question
export const deleteQuestion = async (id) => {
  const { data } = await API.delete(`/questions/${id}`);
  return data;
};