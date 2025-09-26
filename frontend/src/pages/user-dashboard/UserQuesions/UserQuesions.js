
import { useState, useEffect } from "react";
import Navbar from "../UserHome/components/Nabar";
import "./UserQuesions.css";
import Modal from "react-modal";
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from "../../../apis/quesionApi";

// Set app element for accessibility
Modal.setAppElement('#root');

const UserQuesions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({ question: "" });
  const [formError, setFormError] = useState("");
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Fetch all questions
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await getQuestions();
      setQuestions(response.questions);
      setError(null);
    } catch (err) {
      setError("Failed to load questions. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchQuestions();
  }, []);
  
  // Validate question
  const validateQuestion = (question) => {
    // Question must be at least 10 characters and not more than 500
    const questionRegex = /^.{10,500}$/;
    if (!questionRegex.test(question)) {
      setFormError("Question must be between 10 and 500 characters");
      return false;
    }
    setFormError("");
    return true;
  };
  
  // Handle create question
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    
    if (!validateQuestion(currentQuestion.question)) {
      return;
    }
    
    setLoading(true);
    try {
      await createQuestion({ question: currentQuestion.question });
      setShowCreateModal(false);
      setCurrentQuestion({ question: "" });
      fetchQuestions();
      setError(null);
    } catch (err) {
      setError("Failed to create question. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit question
  const handleEditQuestion = async (e) => {
    e.preventDefault();
    
    if (!validateQuestion(currentQuestion.question)) {
      return;
    }
    
    setLoading(true);
    try {
      await updateQuestion(currentQuestion._id, { question: currentQuestion.question });
      setShowEditModal(false);
      setCurrentQuestion({ question: "" });
      fetchQuestions();
      setError(null);
    } catch (err) {
      setError("Failed to update question. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete question
  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setLoading(true);
      try {
        await deleteQuestion(id);
        fetchQuestions();
        setError(null);
      } catch (err) {
        setError("Failed to delete question. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Open edit modal with question data
  const openEditModal = (question) => {
    setCurrentQuestion(question);
    setShowEditModal(true);
  };
  
  // Modal styles
  const customModalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: '500px',
      width: '90%',
      padding: '0',
      border: '1px solid #f0e6d2',
      borderRadius: '8px',
      boxShadow: '0 10px 30px rgba(84, 65, 60, 0.2)',
    },
    overlay: {
      backgroundColor: 'rgba(84, 65, 60, 0.6)',
      zIndex: 1000,
    }
  };
  
  return (
    <div>
      <Navbar />
      <div className="questions-container">
        <div className="questions-header">
          <h2>Questions & Answers</h2>
          <button 
            className="btn-primary" 
            onClick={() => {
              setCurrentQuestion({ question: "" });
              setShowCreateModal(true);
            }}
          >
            Ask a Question
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        {loading && <div className="loading">Loading...</div>}
        
        {!loading && questions.length === 0 && (
          <div className="no-questions">No questions found. Be the first to ask a question!</div>
        )}
        
        {!loading && questions.length > 0 && (
          <div className="questions-grid">
            {questions.map((q) => (
              <div className="question-card" key={q._id}>
                <div className="question-card-header">
                  <h3>{q.question}</h3>
                  {user && user._id === q.user?._id && (
                    <div className="question-actions">
                      <button 
                        className="btn-edit" 
                        onClick={() => openEditModal(q)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteQuestion(q._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className="question-card-body">
                  <div className="answer-section">
                    <h4>Answer:</h4>
                    {q.answer ? (
                      <p className="answer-text">{q.answer}</p>
                    ) : (
                      <p className="no-answer">Not answered yet</p>
                    )}
                  </div>
                  <div className="question-meta">
                    <p>Asked by: <span>{q.user?.name || "Unknown"}</span></p>
                    <p>Date: <span>{new Date(q.createdAt).toLocaleDateString()}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Create Question Modal */}
        <Modal
          isOpen={showCreateModal}
          onRequestClose={() => setShowCreateModal(false)}
          style={customModalStyles}
          contentLabel="Ask a Question"
        >
          <div className="modal-header">
            <h3>Ask a Question</h3>
            <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
          </div>
          <form className="question-form" onSubmit={handleCreateQuestion}>
            <div className="form-group">
              <label htmlFor="question">Your Question</label>
              <textarea
                id="question"
                placeholder="Type your question here..."
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                className={formError ? "error" : ""}
                required
              />
              {formError && <span className="error-text">{formError}</span>}
              <small>Your question should be between 10 and 500 characters.</small>
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Question"}
              </button>
            </div>
          </form>
        </Modal>
        
        {/* Edit Question Modal */}
        <Modal
          isOpen={showEditModal}
          onRequestClose={() => setShowEditModal(false)}
          style={customModalStyles}
          contentLabel="Edit Question"
        >
          <div className="modal-header">
            <h3>Edit Your Question</h3>
            <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
          </div>
          <form className="question-form" onSubmit={handleEditQuestion}>
            <div className="form-group">
              <label htmlFor="edit-question">Your Question</label>
              <textarea
                id="edit-question"
                placeholder="Type your question here..."
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                className={formError ? "error" : ""}
                required
              />
              {formError && <span className="error-text">{formError}</span>}
              <small>Your question should be between 10 and 500 characters.</small>
            </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Question"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default UserQuesions;