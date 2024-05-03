import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import PropTypes from "prop-types";
import Modal from "@material-ui/core/Modal";
import Fade from "@material-ui/core/Fade";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import TextField from "@material-ui/core/TextField";
import Switch from "@material-ui/core/Switch";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 4),
    color: theme.palette.text.primary,
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    marginBottom: theme.spacing(2),
  },
  inputRow: {
    display: "flex",
    marginBottom: theme.spacing(2),
  },
  input: {
    marginRight: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(2),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  sectionHeading: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightBold,
  },
  fileInputLabel: {
    display: "inline-block",
    cursor: "pointer",
  },
  fileInput: {
    display: "none",
  },
  fileButton: {
    marginLeft: theme.spacing(1),
  },
}));

const BoardSettingsModal = ({ open, onClose }) => {
  const classes = useStyles();
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [recurrentMessage, setRecurrentMessage] = useState("");
  const [isRecurrentMessageEnabled, setIsRecurrentMessageEnabled] =
    useState(false);
  const [recurrentMessageDays, setRecurrentMessageDays] = useState(0);
  const [initialDayOfWeek, setInitialDayOfWeek] = useState("");
  const [tagSwitchValues, setTagSwitchValues] = useState({});
  const [initialSwitchValues, setInitialSwitchValues] = useState({});
  const [selectedRptDays, setSelectedRptDays] = useState("0");
  const [fileToUpload, setFileToUpload] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tags/kanban");
      const fetchedTags = response.data.lista || [];

      const initialSwitchValues = {};
      fetchedTags.forEach((tag) => {
        initialSwitchValues[tag.id] = tag.actCamp === 1;
      });

      setTags(fetchedTags);
      setInitialSwitchValues(initialSwitchValues);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchTags();
    }
  }, [open]);

  useEffect(() => {
    if (selectedTag) {
      setSelectedRptDays(
        selectedTag.rptDays ? selectedTag.rptDays.toString() : "0"
      );
    }
  }, [selectedTag]);

  useEffect(() => {
    if (recurrentMessageDays !== "") {
      const initialDay = Object.keys(daysOfWeekMap).find(
        (day) => daysOfWeekMap[day] === parseInt(recurrentMessageDays)
      );
      setInitialDayOfWeek(initialDay || "");
    }
  }, [recurrentMessageDays]);

  const fetchTagInfo = async (tagId) => {
    try {
      const response = await api.get(`/tags/${tagId}`);
      const tagInfo = response.data;
      setRecurrentMessage(tagInfo.msgR || "");
      setRecurrentMessageDays(tagInfo.rptDays || "0");
    } catch (error) {
      console.error(error);
    }
  };

  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
      fetchTagInfo(tag.id);
      setTagSwitchValues(initialSwitchValues);
    }
  };

  const daysOfWeekMap = {
    Domingo: 0,
    Segunda: 1,
    Terça: 2,
    Quarta: 3,
    Quinta: 4,
    Sexta: 5,
    Sábado: 6,
  };

  const handleSave = async () => {
    try {
      if (selectedTag) {
        const tagData = {
          msgR: recurrentMessage,
          rptDays: parseInt(selectedRptDays),
          actCamp: tagSwitchValues[selectedTag.id] ? 1 : 0,
        };

        await api.put(`/tags/${selectedTag.id}`, tagData);

        if (fileToUpload){
          const formData = new FormData();
        formData.append("file", fileToUpload);

        await api.post(`/tags/${selectedTag.id}/media-upload`, formData);
        setSelectedTag({ ...selectedTag, mediaName: fileToUpload.name });

        // Limpe o arquivo selecionado após o envio
        setFileToUpload(null);
      
        }

        onClose();
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error.message);
    }
  };

  const handleDeleteFile = async () => {
    try {
      await api.delete(`/tags/${selectedTag.id}/media-upload`);
      setSelectedTag({ ...selectedTag, mediaName: null });
      onClose();
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error.message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className={classes.modal}
      closeAfterTransition
    >
      <Fade in={open}>
        <div className={classes.paper}>
          <h2>Configurações Do Quadro De Campanha</h2>

          <div>
            <Typography
              variant="h3"
              align="center"
              style={{ fontSize: "100%" }}
            >
              Lista De Quadros
            </Typography>

            <List component="nav">
              {tags.map((tag) => (
                <div key={tag.id} style={{ marginBottom: 10 }}>
                  <ListItem
                    button
                    onClick={() => handleTagClick(tag)}
                    style={{
                      backgroundColor: tag.color,
                      color: "white",
                      borderRadius: 10,
                    }}
                  >
                    <ListItemText primary={tag.name} />

                    {selectedTag === tag ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>

                  <Collapse
                    in={selectedTag === tag}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      <div className={classes.inputContainer}>
                        <Divider className={classes.divider} />
                        <h4 className={classes.sectionHeading}>
                          Campanha Recorrente
                        </h4>

                        <TextField
                          label="Mensagem Recorrente"
                          variant="outlined"
                          multiline
                          rows={4}
                          value={recurrentMessage}
                          onChange={(e) =>
                            setRecurrentMessage(e.target.value)
                          }
                        />

                        <InputLabel>Repetir a cada:</InputLabel>
                        <Select
                          value={selectedRptDays}
                          onChange={(e) =>
                            setSelectedRptDays(e.target.value)
                          }
                        >
                          {Array.from({ length: 31 }, (_, index) => index).map(
                            (number) => (
                              <MenuItem
                                key={number}
                                value={number.toString()}
                              >
                                {number}
                              </MenuItem>
                            )
                          )}
                        </Select>
                        <InputLabel>0 = Não Repetir</InputLabel>

                        <FormControlLabel
                          control={
                            <Switch
                              checked={tagSwitchValues[tag.id]}
                              onChange={(e) =>
                                setTagSwitchValues({
                                  ...tagSwitchValues,
                                  [tag.id]: e.target.checked,
                                })
                              }
                              color="primary"
                            />
                          }
                          label={
                            tagSwitchValues[tag.id]
                              ? "Campanha Ativa"
                              : "Campanha Inativa"
                          }
                        />

                       {selectedTag && (
  <div>
    {selectedTag.mediaName && (
      <div>
        <p>Arquivo: {selectedTag.mediaName}</p>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setIsDeleteModalOpen(true)}
          style={{ marginRight: 10 }}
        >
          Excluir Arquivo
        </Button>
      </div>
    )}
    {!selectedTag.mediaName && (
  <label htmlFor="file-upload" className={classes.fileInputLabel}>
    <input
      id="file-upload"
      type="file"
      accept=".png,.jpg,.jpeg,.mp4,.mp3,.ogg"
      onChange={(e) => setFileToUpload(e.target.files[0])}
      className={classes.fileInput}
    />
    <Button
      variant="contained"
      component="span"
      className={classes.fileButton}
    >
      {fileToUpload
        ? fileToUpload.name.length > 20
          ? `${fileToUpload.name.substring(0, 20)}...`
          : fileToUpload.name
        : "Escolher Arquivo"}
    </Button>
  </label>
)}
  </div>
)}

                        

                        <Button
                          variant="contained"
                          color="primary"
                          className={classes.button}
                          onClick={handleSave}
                        >
                          Salvar
                        </Button>
                      </div>
                    </List>
                  </Collapse>
                </div>
              ))}
            </List>
          </div>

          <Modal
            open={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            className={classes.modal}
            closeAfterTransition
          >
            <div className={classes.paper}>
              <h2>Deseja realmente excluir o arquivo?</h2>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  handleDeleteFile();
                }}
                style={{ marginRight: 10 }}
              >
                Confirmar Exclusão
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </Modal>
        </div>
      </Fade>
    </Modal>
  );
};

BoardSettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BoardSettingsModal;
