import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './MyCalendar.css';
import { TextField } from '@material-ui/core';
import api from "../../services/api";

moment.locale('pt-br');
const localizer = momentLocalizer(moment);

const MyCalendar = ({ onEventCompleted }) => {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get(`${process.env.REACT_APP_BACKEND_URL}/eventos`);
        setEvents(response.data);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleSelectSlot = ({ start }) => {
    const formattedDate = moment(start).format('YYYY-MM-DDTHH:mm');
    setSelectedDate(formattedDate);
    setModalIsOpen(true);
    setSelectedEvent(null);
  };

  const handleSelectEvent = (event) => {
    setEventTitle(event.title);
    setEventDescription(event.description);
    const formattedDate = moment(event.start).format('YYYY-MM-DDTHH:mm');
    setSelectedDate(formattedDate);
    setSelectedEvent(event);
    setModalIsOpen(true);
  };

  const handleAddEvent = async () => {
    const newEvent = {
      title: eventTitle,
      description: eventDescription,
      start: new Date(selectedDate),
      end: new Date(selectedDate),
    };

    try {
      const response = await api.post(`${process.env.REACT_APP_BACKEND_URL}/eventos`, newEvent);
      setEvents([...events, response.data]);
      closeModal();
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEventTitle('');
    setEventDescription('');
    setSelectedDate('');
    setSelectedEvent(null);
  };

  const handleCompleteEvent = async (id) => {
    try {
      await api.put(`${process.env.REACT_APP_BACKEND_URL}/eventos/${id}/concluido`);
      const updatedEvents = events.map((event) => {
        if (event.id === id) {
          return { ...event, concluido: true };
        }
        return event;
      });
      setEvents(updatedEvents);
      closeModal();
    } catch (error) {
      console.error('Erro ao marcar evento como concluído:', error);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await api.delete(`${process.env.REACT_APP_BACKEND_URL}/eventos/${id}`);
      const updatedEvents = events.filter((event) => event.id !== id);
      setEvents(updatedEvents);
      closeModal();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
    }
  };

  const messages = {
    today: 'Hoje',
    previous: 'Anterior',
    next: 'Próximo',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
  };

  const eventStyleGetter = (event, start, end, isSelected) => {
    const style = {};
    if (event.concluido) {
      style.className = 'rbc-event-concluido';
    }
    return style;
  };

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        messages={messages}
        className="react-big-calendar"
      />
      {modalIsOpen && (
        <div className="modal">
          <h2>{selectedEvent ? 'Editar Evento' : 'Agendar Evento'}</h2>
          <TextField
            className="date-time-picker"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            type="datetime-local"
            fullWidth
            margin="normal"
            variant="outlined"
            required
            InputProps={{ style: { border: 'none' } }}
          />
          <input
            type="text"
            placeholder="Título do Evento"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            className="input-field"
          />
          <textarea
            placeholder="Descrição do Evento"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            className="text-area"
          />
          <div className="button-group">
            <button className="primary-action" onClick={handleAddEvent}>
              {selectedEvent ? 'Atualizar' : 'Agendar'}
            </button>
            <button className="secondary-action" onClick={closeModal}>
              Cancelar
            </button>
            {selectedEvent && (
              <>
                <button className="primary-action" onClick={() => handleCompleteEvent(selectedEvent.id)}>
                  Concluído
                </button>
                <button className="secondary-action" onClick={() => handleDeleteEvent(selectedEvent.id)}>
                  Excluir
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
