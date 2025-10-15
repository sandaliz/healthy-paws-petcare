
import { useState, useEffect } from "react";
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
  const [currentQuestion, setCurrentQuestion] = useState({ question: "", category: "" });
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
      maxWidth: '900px',
      width: '90%',
      padding: '0',
      border: 'none',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
    }
  };
  
  return (
    <div>
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
        
        {!loading && questions.length === 0 && (
          <div className="no-questions">No questions found. Be the first to ask a question!</div>
        )}
        
        {!loading && questions.length > 0 && (
          <div className="questions-grid">
            {questions.map((q, index) => (
              <div className="question-card" key={q._id}>
                <div className="question-card-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      {(q.user?.name || "Anonymous").charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <p className="user-name">{q.user?.name || "Anonymous"}</p>
                      <p className="question-date">{new Date(q.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
                <div className="question-card-body">
                  <h3>{q.question.length > 60 ? q.question.substring(0, 60) : q.question}</h3>
                  <p className="question-description">
                    {q.answer || "Hi does Gleneagles hospital KL have this service? Thanks"}
                  </p>
                  {user && user._id === q.user?._id && (
                    <div className="question-footer">
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
                    </div>
                  )}
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
          <div className="ask-vet-modal">
            <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            <div className="ask-vet-content">
              <div className="ask-vet-form-section">
                <h2 className="ask-vet-title">Ask a vet</h2>
                <p className="ask-vet-description">
                  Ask a vet a question at your convenience! Knowing that each expert is a 
                  veterinarian and has been screened and vetted prior to being invited to 
                  consult with you.
                </p>
                
                <form onSubmit={handleCreateQuestion}>
                  <div className="form-group-vet">
                    <label htmlFor="question">Enter your message</label>
                    <textarea
                      id="question"
                      placeholder="My dog is not eating food what to do next?"
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      className={formError ? "question-textarea error" : "question-textarea"}
                      rows="5"
                      required
                    />
                    {formError && <span className="error-text">{formError}</span>}
                  </div>

                  <p className="powered-by">Powered by <strong>The Vet Experts</strong></p>

                  <button 
                    type="submit" 
                    className="ask-now-btn"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Ask now"}
                  </button>
                </form>
              </div>

              <div className="ask-vet-illustration">
                <div className="illustration-image">
                  <img 
                    src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500&h=500&fit=crop" 
                    alt="Veterinarian with pets" 
                  />
                </div>
              </div>
            </div>
          </div>
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