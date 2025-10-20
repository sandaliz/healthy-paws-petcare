import { useState, useEffect } from "react";
import { getQuestions, updateQuestion } from "../../apis/quesionApi";
import "./DoctorQuesions.css";
import Modal from "react-modal";

// Set app element for accessibility
Modal.setAppElement('#root');

const DoctorQuesions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({ question: "", answer: "" });
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
  
  // Validate answer
  const validateAnswer = (answer) => {
    const answerRegex = /^.{10,1000}$/;
    if (!answerRegex.test(answer)) {
      setFormError("Answer must be between 10 and 1000 characters");
      return false;
    }
    setFormError("");
    return true;
  };
  
  // Handle submit answer
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!validateAnswer(currentQuestion.answer)) {
      return;
    }
    
    setLoading(true);
    try {
      await updateQuestion(currentQuestion._id, { answer: currentQuestion.answer });
      setShowAnswerModal(false);
      setCurrentQuestion({ question: "", answer: "" });
      fetchQuestions();
      setError(null);
    } catch (err) {
      setError("Failed to submit answer. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Open answer modal with question data
  const openAnswerModal = (question) => {
    setCurrentQuestion({
      ...question,
      answer: question.answer || ""
    });
    setShowAnswerModal(true);
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
      maxWidth: '600px',
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
    <div className="doctor-questions-container">
      <div className="questions-header">
        <h2>Patient Questions</h2>
        <p>Logged in as: <span>{user?.name || "Doctor"}</span></p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading && <div className="loading">Loading...</div>}
      
      {!loading && questions.length === 0 && (
        <div className="no-questions">No questions found from patients.</div>
      )}
      
      {!loading && questions.length > 0 && (
        <div className="questions-grid">
          {questions.map((q) => (
            <div className="question-card" key={q._id}>
              <div className="question-card-header">
                <h3>{q.question}</h3>
                <div className="question-status">
                  {q.answer ? (
                    <span className="status answered">Answered</span>
                  ) : (
                    <span className="status unanswered">Unanswered</span>
                  )}
                </div>
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
                <div className="question-actions">
                  <button 
                    className="btn-answer" 
                    onClick={() => openAnswerModal(q)}
                  >
                    {q.answer ? "Edit Answer" : "Answer Question"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Answer Question Modal */}
      <Modal
        isOpen={showAnswerModal}
        onRequestClose={() => setShowAnswerModal(false)}
        style={customModalStyles}
        contentLabel="Answer Question"
      >
        <div className="modal-header">
          <button className="modal-close" onClick={() => setShowAnswerModal(false)}>×</button>
        </div>
        <form className="answer-form" onSubmit={handleSubmitAnswer}>
          <div className="form-group">
            <label>Patient's Question:</label>
            <div className="patient-question">{currentQuestion.question}</div>
          </div>
          <div className="form-group">
            <label htmlFor="answer">Your Answer:</label>
            <textarea
              id="answer"
              placeholder="Type your answer here..."
              value={currentQuestion.answer}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, answer: e.target.value })}
              className={formError ? "error" : ""}
              required
            />
            {formError && <span className="error-text">{formError}</span>}
            <small>Your answer should be between 10 and 1000 characters.</small>
          </div>
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setShowAnswerModal(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Answer"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DoctorQuesions;
