import React, { useState, useEffect } from "react";
import { getEvents } from "../../../apis/eventApi";
import "./UserEvents.css";

const UserEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents();
      setEvents(response.events || response || []);
    } catch (err) {
      setError("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const time = new Date();
    time.setHours(hours, minutes);
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isUpcoming = (eventDate) => {
    return new Date(eventDate) >= new Date();
  };

  if (loading) {
    return (
      <div>
        <div className="loading">Loading events...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="events-container">
        <div className="events-header">
          <h1>Upcoming Events</h1>
          <p>Join us for exciting events and activities</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {events.length === 0 ? (
          <div className="no-events">
            <h3>No events available</h3>
            <p>Stay tuned for upcoming events!</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <div
                key={event._id}
                className={`event-card ${
                  isUpcoming(event.eventDate) ? "upcoming" : "past"
                }`}
                onClick={() => handleEventClick(event)}
              >
                <div className="event-image">
                  <img src={event.imageUrl} alt={event.name} loading="lazy" />
                  <div className="event-overlay">
                    <span>View Details</span>
                  </div>
                  {isUpcoming(event.eventDate) && (
                    <div className="upcoming-badge">Upcoming</div>
                  )}
                </div>
                <div className="event-content">
                  <div className="event-date-time">
                    <div className="event-date">
                      {formatDate(event.eventDate)}
                    </div>
                    <div className="event-time">
                      {formatTime(event.fromTime)} - {formatTime(event.toTime)}
                    </div>
                  </div>
                  <h3 className="event-title">{event.name}</h3>
                  <p className="event-description">
                    {event.description.length > 100
                      ? `${event.description.substring(0, 100)}...`
                      : event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && selectedEvent && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <button className="modal-close" onClick={closeModal}>
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-image">
                  <img src={selectedEvent.imageUrl} alt={selectedEvent.name} />
                  {isUpcoming(selectedEvent.eventDate) && (
                    <div className="modal-upcoming-badge">Upcoming Event</div>
                  )}
                </div>
                <div className="modal-text">
                  <h2 className="modal-title">{selectedEvent.name}</h2>
                  <div className="modal-event-info">
                    <div className="modal-date-time">
                      <div className="modal-date">
                        <strong>Date:</strong>{" "}
                        {formatDate(selectedEvent.eventDate)}
                      </div>
                      <div className="modal-time">
                        <strong>Time:</strong>{" "}
                        {formatTime(selectedEvent.fromTime)} -{" "}
                        {formatTime(selectedEvent.toTime)}
                      </div>
                    </div>
                  </div>
                  <div className="modal-description">
                    <h4>About this event</h4>
                    {selectedEvent.description
                      .split("\n")
                      .map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserEvents;
