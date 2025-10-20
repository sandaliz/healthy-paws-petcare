import { useState, useEffect } from "react";
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
} from "../../apis/eventApi";
import cloudinaryService from "../../services/cloudinaryService";
import "./DoctorEvents.css";

const DoctorEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    eventDate: "",
    fromTime: "",
    toTime: "",
    imageUrl: "",
  });
  const [errors, setErrors] = useState({});
  //const [imageFile, setImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    const filtered = events.filter(
      (event) =>
        event?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event?.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z\s]{2,100}$/;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!nameRegex.test(formData.name)) {
      newErrors.name = "Name must be 2-50 characters, letters and spaces only";
    }

    if (formData.description.length < 10 || formData.description.length > 5000) {
      newErrors.description = "Description must be between 10-500 characters";
    }

    if (!formData.eventDate) {
      newErrors.eventDate = "Event date is required";
    } else {
      const eventDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        newErrors.eventDate = "Event date cannot be in the past";
      }
    }

    if (!timeRegex.test(formData.fromTime)) {
      newErrors.fromTime = "From time must be in HH:MM format";
    }

    if (!timeRegex.test(formData.toTime)) {
      newErrors.toTime = "To time must be in HH:MM format";
    }

    if (formData.fromTime && formData.toTime) {
      const fromTime = new Date(`2000-01-01 ${formData.fromTime}`);
      const toTime = new Date(`2000-01-01 ${formData.toTime}`);
      if (fromTime >= toTime) {
        newErrors.toTime = "To time must be after from time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: "Only JPEG, PNG, and WebP images are allowed",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: "Image size must be less than 5MB",
      }));
      return;
    }

    //setImageFile(file);
    setImageUploading(true);
    setErrors((prev) => ({ ...prev, imageUrl: "" }));

    try {
      const result = await cloudinaryService.uploadImage(file);
      if (result.success) {
        setFormData((prev) => ({ ...prev, imageUrl: result.url }));
      } else {
        setErrors((prev) => ({ ...prev, imageUrl: result.error }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, imageUrl: "Failed to upload image" }));
    } finally {
      setImageUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      eventDate: "",
      fromTime: "",
      toTime: "",
      imageUrl: "",
    });
    setErrors({});
    //setImageFile(null);
    setCurrentEvent(null);
  };

  const handleCreateEvent = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createEvent(formData);
      await fetchEvents();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      setErrors((prev) => ({ ...prev, submit: "Failed to create event" }));
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      setShowEditModal(false);
      await updateEvent(currentEvent._id, formData);
      await fetchEvents();
      resetForm();
    } catch (error) {
      setErrors((prev) => ({ ...prev, submit: "Failed to update event" }));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteEvent(eventId);
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
    }
  };

  const fetchEvents = async () => {
    const events = await getEvents();
    setEvents(events["events"] ?? []);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openEditModal = (event) => {
    setCurrentEvent(event);
    setFormData({
      name: event.name,
      description: event.description,
      eventDate: event.eventDate.split("T")[0],
      fromTime: event.fromTime,
      toTime: event.toTime,
      imageUrl: event.imageUrl,
    });
    setShowEditModal(true);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  return (
    <div className="doctor-events">
      <div className="events-header">
        <h2>Event Management</h2>
        <button className="create-btn" onClick={openCreateModal}>
          Create Event
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="events-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Date</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event._id}>
                <td>
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      className="event-image"
                    />
                  )}
                </td>
                <td>{event.name}</td>
                <td>{event.description.substring(0, 100)}...</td>
                <td>{new Date(event.eventDate).toLocaleDateString()}</td>
                <td>
                  {event.fromTime} - {event.toTime}
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => openEditModal(event)}
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteEvent(event._id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Event Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "error" : ""}
                />
                {errors.name && (
                  <span className="error-text">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={errors.description ? "error" : ""}
                />
                {errors.description && (
                  <span className="error-text">{errors.description}</span>
                )}
              </div>

              <div className="form-group">
                <label>Event Date</label>
                <input
                  type="date"
                  name="eventDate"
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  className={errors.eventDate ? "error" : ""}
                />
                {errors.eventDate && (
                  <span className="error-text">{errors.eventDate}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>From Time</label>
                  <input
                    type="time"
                    name="fromTime"
                    value={formData.fromTime}
                    onChange={handleInputChange}
                    className={errors.fromTime ? "error" : ""}
                  />
                  {errors.fromTime && (
                    <span className="error-text">{errors.fromTime}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>To Time</label>
                  <input
                    type="time"
                    name="toTime"
                    value={formData.toTime}
                    onChange={handleInputChange}
                    className={errors.toTime ? "error" : ""}
                  />
                  {errors.toTime && (
                    <span className="error-text">{errors.toTime}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Event Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {imageUploading && <span>Uploading...</span>}
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="image-preview"
                  />
                )}
                {errors.imageUrl && (
                  <span className="error-text">{errors.imageUrl}</span>
                )}
              </div>

              {errors.submit && (
                <div className="error-text">{errors.submit}</div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button onClick={handleCreateEvent} disabled={loading}>
                {loading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Event</h3>
              <button onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Event Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? "error" : ""}
                />
                {errors.name && (
                  <span className="error-text">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={errors.description ? "error" : ""}
                />
                {errors.description && (
                  <span className="error-text">{errors.description}</span>
                )}
              </div>

              <div className="form-group">
                <label>Event Date</label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  className={errors.eventDate ? "error" : ""}
                />
                {errors.eventDate && (
                  <span className="error-text">{errors.eventDate}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>From Time</label>
                  <input
                    type="time"
                    name="fromTime"
                    value={formData.fromTime}
                    onChange={handleInputChange}
                    className={errors.fromTime ? "error" : ""}
                  />
                  {errors.fromTime && (
                    <span className="error-text">{errors.fromTime}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>To Time</label>
                  <input
                    type="time"
                    name="toTime"
                    value={formData.toTime}
                    onChange={handleInputChange}
                    className={errors.toTime ? "error" : ""}
                  />
                  {errors.toTime && (
                    <span className="error-text">{errors.toTime}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Event Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {imageUploading && <span>Uploading...</span>}
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="image-preview"
                  />
                )}
                {errors.imageUrl && (
                  <span className="error-text">{errors.imageUrl}</span>
                )}
              </div>

              {errors.submit && (
                <div className="error-text">{errors.submit}</div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>
              <button onClick={handleEditEvent} disabled={loading}>
                {loading ? "Updating..." : "Update Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorEvents;
