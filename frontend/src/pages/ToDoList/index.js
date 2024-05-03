import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Collapse from '@material-ui/core/Collapse';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import api from '../../services/api';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '2rem',
  },
  inputContainer: {
    display: 'flex',
    width: '100%',
    marginBottom: '1rem',
  },
  input: {
    flex: '1 0 40%',
    marginRight: '1rem',
  },
  descriptionInput: {
    flex: '1 0 40%', // Ajuste a largura máxima conforme necessário
  },
  button: {
    flex: '1 0 20%',
  },
  listContainer: {
    width: '100%',
    marginTop: '1rem',
  },
  list: {
    marginBottom: '5px',
    backgroundColor: '#dfdfdf',
    color: 'black',
    cursor: 'pointer',
    '&.completedTask': {
      backgroundColor: '#c5f7c5', // Cor de fundo para tarefas concluídas
    },
  },
  description: {
    background: '#dfdfdf',
    padding: '8px',
    borderRadius: '4px',
    whiteSpace: 'pre-wrap',
    maxHeight: '100px',
    overflowY: 'auto',
  },
  separator: {
    width: '100%',
    borderBottom: '1px solid gray',
  },
  error: {
    color: 'red',
  },
  card: {
    margin: '8px 0',
  },
}));

const ToDoList = () => {
  const classes = useStyles();

  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [error, setError] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
      setError(null);
    } catch (error) {
      if (error.message === 'Network Error') {
        setError('Erro de rede ao buscar tarefas. Verifique sua conexão à internet.');
      } else {
        console.error('Erro ao buscar as tarefas:', error);
        setError('Erro ao buscar as tarefas. Tente novamente mais tarde.');
      }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskChange = (event) => {
    setTask(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleAddTask = async () => {
    if (!task.trim()) {
      return;
    }

    const now = new Date();
    if (editIndex >= 0) {
      const updatedTask = { ...tasks[editIndex], text: task, description: description };
      try {
        await api.put(`/tasks/${updatedTask.id}`, updatedTask);
        const updatedTasks = [...tasks];
        updatedTasks[editIndex] = updatedTask;
        setTasks(updatedTasks);
        setTask('');
        setDescription('');
        setEditIndex(-1);
      } catch (error) {
        console.error('Erro ao atualizar a tarefa:', error);
        setError('Erro ao atualizar a tarefa.');
      }
    } else {
      const newTask = { text: task, description, created_at: now, updated_at: now };
      try {
        const response = await api.post('/tasks', newTask);
        newTask.id = response.data.id;
        setTasks([...tasks, newTask]);
        setTask('');
        setDescription('');
      } catch (error) {
        console.error('Erro ao criar a tarefa:', error);
        setError('Erro ao criar a tarefa.');
      }
    }
  };

  const handleEditTask = (index) => {
    setTask(tasks[index].text);
    setDescription(tasks[index].description);
    setEditIndex(index);
  };

  const handleDeleteTask = async (index) => {
    const taskId = tasks[index].id;
    try {
      await api.delete(`/tasks/${taskId}`);
      const updatedTasks = [...tasks];
      updatedTasks.splice(index, 1);
      setTasks(updatedTasks);
      setError(null);
    } catch (error) {
      console.error('Erro ao excluir a tarefa:', error);
      setError('Erro ao excluir a tarefa.');
    }
  };

  return (
    <div className={classes.root}>
      <div className={classes.inputContainer}>
        <TextField
          className={classes.input}
          label="Nova tarefa"
          value={task}
          onChange={handleTaskChange}
          variant="outlined"
        />
        <TextField
          className={classes.descriptionInput}
          label="Descrição"
          value={description}
          onChange={handleDescriptionChange}
          variant="outlined"
          multiline
          rows={1}
        />
        <Button variant="contained" color="primary" onClick={handleAddTask}>
          {editIndex >= 0 ? 'Salvar' : 'Adicionar'}
        </Button>
      </div>
      <div className={classes.listContainer}>
        {error && <div className={classes.error}>{error}</div>}
        <List>
          {tasks.map((task, index) => (
            <React.Fragment key={task.id}>
              <ListItem
                className={`${classes.list} ${task.completed ? classes.completedTask : ''}`}
                onClick={() => setExpandedTask(expandedTask === index ? null : index)}
              >
                <ListItemText primary={task.text} />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleEditTask(index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteTask(index)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Collapse in={expandedTask === index}>
                <Card className={classes.card}>
                  <CardContent>
                    <p className={classes.description}>{task.description}</p>
                  </CardContent>
                </Card>
              </Collapse>
              {index < tasks.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </div>
    </div>
  );
};

export default ToDoList;
