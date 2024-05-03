import React, { useState, useEffect } from 'react';
import { Select, MenuItem, FormControl, InputLabel, Button, Container, Paper, Typography } from '@material-ui/core';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../../services/api";
import './TagSelect.css';

function TagSelect() {
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await api.get('/tags/list');
        setTags(response.data);
      } catch (error) {
        console.error('Erro ao buscar tags:', error);
      }
    }

    fetchTags();
  }, []);

  const handleTagChange = (event) => {
    const newSelectedTag = event.target.value;
    console.log('Novo ID da tag selecionada:', newSelectedTag);
    setSelectedTag(newSelectedTag);
  };

  const handleFetchTickets = async () => {
    try {
      console.log('Chamando API com o ID da tag:', selectedTag);
      const response = await api.get(`/api/ticket/ListByTagIsAuth/${selectedTag}`);
      const fetchedTickets = response.data.tickets;

      if (fetchedTickets.length === 0) {
        toast.warn('Não foram encontrados tickets para a tag selecionada.', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }

      setTickets(fetchedTickets);
    } catch (error) {
      console.error('Erro ao buscar tickets por tag:', error);
    }
  };

  return (
    <Container maxWidth="md" className="container">
      <Paper elevation={3} className="paper">
        <Typography variant="h4" gutterBottom>
          Selecione uma Tag
        </Typography>

        <FormControl fullWidth>
          <InputLabel id="tag-select-label">Tags</InputLabel>
          <Select
            labelId="tag-select-label"
            id="tag-select"
            value={selectedTag}
            onChange={handleTagChange}
          >
            {tags.map((tag) => (
              <MenuItem key={tag.id} value={tag.id}>
                {tag.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div className="button-container">
          <Button
            variant="contained"
            color="primary"
            onClick={handleFetchTickets}
            className="fetch-button"
          >
            Buscar Tickets
          </Button>
        </div>

        {tickets.length > 0 && (
          <div className="results">
            <Typography variant="h5" gutterBottom>
              Resultados ({tickets.length} Tickets Encontrados)
            </Typography>
            <ul>
              {tickets.map((ticket) => (
                <li key={ticket.id} className="result-item">
                  <strong>{ticket.contact.name}</strong>
                  <p>Número: {ticket.contact.number}</p>
                  <p>Email: {ticket.contact.email}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ToastContainer />
      </Paper>
    </Container>
  );
}

export default TagSelect;
