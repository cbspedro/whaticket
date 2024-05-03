import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Typography from "@material-ui/core/Typography";
import { Button, FormControl, IconButton, InputLabel, Link, MenuItem, Select, StepContent, TextField } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import SaveIcon from "@material-ui/icons/Save";
import EditIcon from "@material-ui/icons/Edit";
import api from "../../services/api";
import toastError from "../../errors/toastError";

import { useStyles } from "./style";
import dataApi from "./dataApi";
import { toast } from "react-toastify";


export function QueueOptionStepper({ queueId, options, updateOptions }) {
  const classes = useStyles();
  const [activeOption, setActiveOption] = useState(-1);
  const [optionType, setOptionType] = useState('Texto');
  const [file, setFile] = useState(null);
  const [link, setLink] = useState(null);

  const makeFileLink = (option) => {
    if (!option) return '';
    if (option.message)  {
      return `/public/${option.message}`;
    } 
    return '';
  }

  const handleOption = (index) => async () => {
    setActiveOption(index);
    const option = options[index];

    if (option !== undefined && option.id !== undefined) {
      try {
        const { data } = await api.request({
          url: "/queue-options",
          method: "GET",
          params: { queueId, parentId: option.id },
        });
        const optionList = data.map((option) => {
          return {
            ...option,
            children: [],
            edition: false,
          };
        });
        option.children = optionList;
        updateOptions();
      } catch (e) {
        toastError(e);
      }
    }
  };

  const handleSave = async (option) => {
    try {
      if (option.id) {
        const {data} = await api.request({
          url: `/queue-options/${option.id}`,
          method: "PUT",
          data: option,
        });
      } else {
        const { data } = await api.request({
          url: `/queue-options`,
          method: "POST",
          data: option,
        });
        option.id = data.id;
      }
      option.edition = false;
      updateOptions();
    } catch (e) {
      toastError(e);
    }
  };

  const handleSaveFile = async (option) => {
    if (!file) return;
    if (!option.id) {
      toastError('Opção não salva, salve a opção antes de adicionar um arquivo');
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      const {data} = await api.request({
        url: `/queue-options/${option.id}/file`,
        method: "POST",
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      option.edition = false;
      console.log(data);
      updateOptions();
      toast.success('Arquivo adicionado.');
    } catch (e) {
      toastError(e);
    }
  };

  const handleOptionChangeType = (event, index) => {
    options[index].optionType = event.target.value;
    updateOptions();
  };

  const handleSetFile = () => {
    const file = document.getElementById('file').files[0];
    setFile(file);
    console.log(file);
  }

  const handleEdition = (index) => {
    options[index].edition = !options[index].edition;
    updateOptions();
  };

  const handleDeleteOption = async (index) => {
    const option = options[index];
    if (option !== undefined && option.id !== undefined) {
      try {
        await api.request({
          url: `/queue-options/${option.id}`,
          method: "DELETE",
        });
      } catch (e) {
        toastError(e);
      }
    }
    options.splice(index, 1);
    options.forEach(async (option, order) => {
      option.option = order + 1;
      await handleSave(option);
    });
    updateOptions();
  };

  const handleOptionChangeTitle = (event, index) => {
    options[index].title = event.target.value;
    updateOptions();
  };

  const handleOptionChangeMessage = (event, index) => {
    options[index].message = event.target.value;
    updateOptions();
  };

  const renderTitle = (index) => {

    const option = options[index];
    console.log(option);
    if (option.edition) {
      return (
        <>
          <FormControl variant="standard" style={{ width: '100%' }} sx={{ width: '100%' }}>
            <InputLabel>Tipo de opção</InputLabel>
            <Select
              value={option.optionType}
              onChange={(event) => handleOptionChangeType(event, index)}
              label="Tipo de opção">
              <MenuItem value={'Texto'}>Texto</MenuItem>
              <MenuItem value={'Atendente'}>Atendente</MenuItem>
              <MenuItem value={'Fila'}>Fila</MenuItem>
              <MenuItem value={'Arquivo'}>Arquivo</MenuItem>
            </Select>
          </FormControl>
          <TextField
            value={option.title}
            onChange={(event) => handleOptionChangeTitle(event, index)}
            size="small"
            className={classes.input}
            placeholder="Título da opção"
          />
          {option.edition && (
            <>
              <IconButton
                color="primary"
                variant="outlined"
                size="small"
                className={classes.button}
                onClick={() => handleSave(option)}
              >
                <SaveIcon />
              </IconButton>
              <IconButton
                variant="outlined"
                color="secondary"
                size="small"
                className={classes.button}
                onClick={() => handleDeleteOption(index)}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </>
          )}
        </>
      );
    }
    return (
      <>
        <Typography>
          {option.title !== "" ? option.title : "Título não definido"}
          <IconButton
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={() => handleEdition(index)}
          >
            <EditIcon />
          </IconButton>
        </Typography>
      </>
    );
  };

  const renderMessage = (index) => {
    const option = options[index];
    if (option.edition) {
      if (option.optionType === 'Texto') {
        return (
          <>
            <TextField
              style={{ width: "100%" }}
              multiline
              value={option.message}
              onChange={(event) => handleOptionChangeMessage(event, index)}
              size="small"
              className={classes.input}
              placeholder="Digite o texto da opção"
            />
          </>
        );
      } else if (option.optionType === 'Atendente') {
        const users = dataApi.getUsers();
        return (
          <>
            <FormControl variant="standard" style={{ width: '100%' }} sx={{ width: '100%' }}>
              <InputLabel>Atendente</InputLabel>
              <Select
                value={option.message}
                onChange={(event) => handleOptionChangeMessage(event, index)}
                label="Atendente">
                {users.users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );
      } else if (option.optionType === 'Fila') {
        const queues = dataApi.getQueues();
        queues.forEach(queue => {if (queue.id === queue.id.toString()) {queues.splice(queue, 1)}})
        return (
          <>
            <FormControl variant="standard" style={{ width: '100%' }} sx={{ width: '100%' }}>
              <InputLabel>Fila</InputLabel>
              <Select
                value={option.message}
                onChange={(event) => handleOptionChangeMessage(event, index)}
                label="Fila">
                {queues.map((queue) => (
                  <MenuItem key={queue.id} value={queue.id}>{queue.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        );
      } else if (option.optionType === 'Arquivo') {
        return (
          <>
            <input
              accept="image/*,application/pdf"
              className={classes.input}
              id="file"
              type="file"
              name="file"
              onChange={handleSetFile}
            />
            {makeFileLink(option) !== '' && (<><br/><Link href={makeFileLink(option)} target="_blank">Arquivo atual</Link><br/></>)}<br/>
            <Button variant="outlined" onClick={() => handleSaveFile(option)} component="span">Enviar</Button><br/>
          </>
        );
      }
    }
    return (
      <>
        <Typography onClick={() => handleEdition(index)}>
          {option.message}
        </Typography>
      </>
    );
  };

  const handleAddOption = (index) => {
    const optionNumber = options[index].children.length + 1;
    options[index].children.push({
      title: "",
      message: "",
      edition: false,
      option: optionNumber,
      queueId,
      parentId: options[index].id,
      children: [],
    });
    updateOptions();
  };

  const renderStep = (option, index) => {
    return (
      <Step key={index}>
        <StepLabel style={{ cursor: "pointer", width: '100%' }} onClick={handleOption(index)}>
          {renderTitle(index)}
        </StepLabel>
        <StepContent>
          {renderMessage(index)}

          {option.id !== undefined && (
            <>
              <Button
                color="primary"
                size="small"
                onClick={() => handleAddOption(index)}
                startIcon={<AddIcon />}
                variant="outlined"
                className={classes.addButton}
              >
                Adicionar
              </Button>
            </>
          )}
          <QueueOptionStepper
            queueId={queueId}
            options={option.children}
            updateOptions={updateOptions}
          />
        </StepContent>
      </Step>
    );
  };

  const renderStepper = () => {
    return (
      <Stepper
        style={{ marginBottom: 0, paddingBottom: 0 }}
        nonLinear
        activeStep={activeOption}
        orientation="vertical"
      >
        {options.map((option, index) => renderStep(option, index))}
      </Stepper>
    );
  };

  return renderStepper();
}

export function QueueOptions({ queueId }) {
  const classes = useStyles();
  const [options, setOptions] = useState([]);

  const getQueues = async () => {
    try {
      const { data } = await api.request({
        url: "/queue?ax=1",
        method: "GET",
      });
      dataApi.setQueues(data);
    } catch (e) {
      toastError(e);
    }
  }
  
  const getUsers = async () => {
    try {
      const { data } = await api.request({
        url: "/users?ax=2",
        method: "GET",
      });
      dataApi.setUsers(data);      
    } catch (e) {
      toastError(e);
    }
  }

  useEffect(() => {
    if (queueId) {
      const fetchOptions = async () => {
        try {
          const { data } = await api.request({
            url: "/queue-options",
            method: "GET",
            params: { queueId, parentId: -1 },
          });
          const optionList = data.map((option) => {
            return {
              ...option,
              children: [],
              edition: false,
            };
          });
          setOptions(optionList);
        } catch (e) {
          toastError(e);
        }
      };
      fetchOptions();
    }
    getQueues();
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderStepper = () => {
    if (options.length > 0) {
      return (
        <QueueOptionStepper
          queueId={queueId}
          updateOptions={updateOptions}
          options={options}
        />
      );
    }
  };

  const updateOptions = () => {
    setOptions([...options]);
  };

  const addOption = () => {
    const newOption = {
      title: "",
      message: "",
      edition: false,
      option: options.length + 1,
      queueId,
      parentId: null,
      children: [],
    };
    setOptions([...options, newOption]);
  };

  return (
    <div className={classes.root}>
      <br />
      <Typography>
        Opções
        <Button
          color="primary"
          size="small"
          onClick={addOption}
          startIcon={<AddIcon />}
          style={{ marginLeft: 10 }}
          variant="outlined"
        >
          Adicionar
        </Button>
      </Typography>
      {renderStepper()}
    </div>
  );
}
