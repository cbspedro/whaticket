import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import CustomToolTip from "../ToolTips";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import EditIcon from "@material-ui/icons/Edit";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import { FormControlLabel } from "@material-ui/core";
import Input from '@mui/material/Input';
import Switch from "@material-ui/core/Switch";
import SaveIcon from "@material-ui/icons/Save";
import HelpOutlineOutlinedIcon from "@material-ui/icons/HelpOutlineOutlined";

import OptionsChatBot from "../ChatBots/options";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";
import {
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs, FormControl, InputLabel, Link, MenuItem, Select
} from "@material-ui/core";

import { Colorize, Send } from "@material-ui/icons";
import { QueueOptions } from "../QueueOptions";
import SchedulesForm from "../SchedulesForm";
import { getBackendUrl } from "../../config";

const InputFullWidth = ({props}) => {
  return <TextField placeholder="Mensagem" fullWidth style={{width: "100%"}} {...props} />;
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  colorAdorment: {
    width: 20,
    height: 20,
  },
  greetingMessage: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },
  custom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

}));

const QueueSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  color: Yup.string().min(3, "Too Short!").max(9, "Too Long!").required(),
  greetingMessage: Yup.string(),
});

const QueueModal = ({ open, onClose, queueId, onEdit }) => {
  const classes = useStyles();

  const initialState = {
    name: "",
    color: "",
    greetingMessage: "",
    outOfHoursMessage: "",
    chatbots: [],

  };

  const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
  const [queue, setQueue] = useState(initialState);
  const [tab, setTab] = useState(0);
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const greetingRef = useRef();

  const [activeStep, setActiveStep] = React.useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isStepContent, setIsStepContent] = React.useState(true);
  const [isNameEdit, setIsNamedEdit] = React.useState(null);
  const [isGreetingMessageEdit, setGreetingMessageEdit] = React.useState(null);
  const [timestampUpdated, setTimestampUpdated] = useState(null);
  const [file, setFile] = useState(null);

  const [schedules, setSchedules] = useState([
    {
      weekday: "Segunda-feira",
      weekdayEn: "monday",
      startTime: "",
      endTime: "",
    },
    {
      weekday: "Terça-feira",
      weekdayEn: "tuesday",
      startTime: "",
      endTime: "",
    },
    {
      weekday: "Quarta-feira",
      weekdayEn: "wednesday",
      startTime: "",
      endTime: "",
    },
    {
      weekday: "Quinta-feira",
      weekdayEn: "thursday",
      startTime: "",
      endTime: "",
    },
    { weekday: "Sexta-feira", weekdayEn: "friday", startTime: "", endTime: "" },
    { weekday: "Sábado", weekdayEn: "saturday", startTime: "", endTime: "" },
    { weekday: "Domingo", weekdayEn: "sunday", startTime: "", endTime: "" },
  ]);

  useEffect(() => {
    api.get(`/settings`).then(({ data }) => {
      if (Array.isArray(data)) {
        const scheduleType = data.find((d) => d.key === "scheduleType");
        if (scheduleType) {
          setSchedulesEnabled(scheduleType.value === "queue");
        }
      }
    });
  }, []);

  useEffect(() => {
    (async () => {
      if (!queueId) return;
      try {
        const { data } = await api.get(`/queue/${queueId}`);
        setQueue((prevState) => {
          return { ...prevState, ...data };
        });
        setSchedules(data.schedules);
      } catch (err) {
        toastError(err);
      }
    })();

    return () => {
      setQueue({
        name: "",
        color: "",
        greetingMessage: "",
        chatbots: [],
      });
    };
  }, [queueId, open]);

  const handleClose = () => {
    onClose();
    setQueue(initialState);
  };

  const handleSaveQueue = async (values) => {
    try {
      if (queueId) {
        await api.put(`/queue/${queueId}`, { ...values, schedules });
      } else {
        await api.post("/queue", { ...values, schedules });
      }
      toast.success("Queue saved successfully");
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleSaveSchedules = async (values) => {
    toast.success("Clique em salvar para registar as alterações");
    setSchedules(values);
    setTab(0);
  };

  const renderTitle = (index, chatbot, values) => {

    console.log('qqqq', index, chatbot);
    return (
          <FormControlLabel
              control={
                <Field
                  as={Switch}
                  color="primary"
                  name={`chatbots[${index}].optionType`}
                  onChange={e => values.chatbots[index].optionType === 'file' ? values.chatbots[index].optionType = 'file' : values.chatbots[index].optionType = 'text'}
                  checked={
                    values.chatbots[index].optionType === 'file'
                  }
                />
              }
              label="Arquivo"
            />
    );

    
  };

  const handleSaveBot = async (values) => {
    try {
      if (queueId) {
        const { data } = await api.put(`/queue/${queueId}`, values);
        if (data.chatbots && data.chatbots.length) {
          onEdit(data);
          setQueue(data);
        }
      } else {
        const { data } = await api.post("/queue", values);
        if (data.chatbots && data.chatbots.length) {
          setQueue(data);
          onEdit(data);
          handleClose();
        }
      }

      setIsNamedEdit(null)
      setGreetingMessageEdit(null)
      toast.success("Setor salvo com sucesso!");

    } catch (err) {
      toastError(err);
    }
  };

  const handleOptionChangeType = (values, index) => {
    console.log('Run', values.chatbots[index].optionType);
    values.chatbots[index].optionType = values.chatbots[index].optionType !== 'file' ? 'file' : 'text';
    setTimestampUpdated(new Date().getTime());
  };

  const makeFileLink = (option, companyId) => {
    console.log('option', option, companyId);
    if (!option) return '';
    if (option.greetingMessage)  {
      return `${getBackendUrl()}/public/company${companyId}/${option.greetingMessage}`;
    } 
    return '';
  }

  const handleSetFile = () => {
    const file = document.getElementById('file').files[0];
    setFile(file);
    console.log(file);
  }

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
      setTimestampUpdated(new Date().getTime());
      toast.success('Arquivo adicionado.');
    } catch (e) {
      toastError(e);
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        maxWidth="lg"
        fullWidth={true}
        open={open}
        onClose={handleClose}
        scroll="paper"
      >
        <DialogTitle>
          {queueId
            ? `${i18n.t("queueModal.title.edit")}`
            : `${i18n.t("queueModal.title.add")}`}
        </DialogTitle>
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_, v) => setTab(v)}
          aria-label="disabled tabs example"
        >
          <Tab label="Dados da Fila/Setor" />
          {schedulesEnabled && <Tab label="Horários de Atendimento" />}
        </Tabs>
        {tab === 0 && (
          <Paper>
            <Formik
              initialValues={queue}
              validateOnChange={false}
              enableReinitialize={true}
              validationSchema={QueueSchema}
              onSubmit={(values, actions) => {
                setTimeout(() => {
                  handleSaveQueue(values);
                  actions.setSubmitting(false);
                }, 400);
              }}
            >
              {({ handleChange, touched, errors, isSubmitting, values }) => (
                <Form>
                  <DialogContent dividers>
                    <Field
                      as={TextField}
                      label={i18n.t("queueModal.form.name")}
                      autoFocus
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      margin="dense"
                      className={classes.textField}
                    />
                    <Field
                      as={TextField}
                      label={i18n.t("queueModal.form.color")}
                      name="color"
                      id="color"
                      onFocus={() => {
                        setColorPickerModalOpen(true);
                        greetingRef.current.focus();
                      }}
                      error={touched.color && Boolean(errors.color)}
                      helperText={touched.color && errors.color}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <div
                              style={{ backgroundColor: values.color }}
                              className={classes.colorAdorment}
                            ></div>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <IconButton
                            size="small"
                            color="default"
                            onClick={() => setColorPickerModalOpen(true)}
                          >
                            <Colorize />
                          </IconButton>
                        ),
                      }}
                      variant="outlined"
                      margin="dense"
                    />
                    <ColorPicker
                      open={colorPickerModalOpen}
                      handleClose={() => setColorPickerModalOpen(false)}
                      onChange={(color) => {
                        values.color = color;
                        setQueue(() => {
                          return { ...values, color };
                        });
                      }}
                    />
                    {/* <div>
                      <Field
                        as={TextField}
                        label={i18n.t("queueModal.form.greetingMessage")}
                        type="greetingMessage"
                        multiline
                        inputRef={greetingRef}
                        minRows={5}
                        fullWidth
                        name="greetingMessage"
                        error={
                          touched.greetingMessage && Boolean(errors.greetingMessage)
                        }
                        helperText={
                          touched.greetingMessage && errors.greetingMessage
                        }
                        variant="outlined"
                        margin="dense"
                      />
                    </div> */}

                    <div style={{ marginTop: 5 }}>
                      <Grid spacing={1} container>
                        <Grid xs={12} md={schedulesEnabled ? 6 : 12} item>
                          <Field
                            as={TextField}
                            label={i18n.t("queueModal.form.greetingMessage")}
                            type="greetingMessage"
                            multiline
                            inputRef={greetingRef}
                            rows={5}
                            fullWidth
                            name="greetingMessage"
                            error={
                              touched.greetingMessage &&
                              Boolean(errors.greetingMessage)
                            }
                            helperText={
                              touched.greetingMessage && errors.greetingMessage
                            }
                            variant="outlined"
                            margin="dense"
                          />
                        </Grid>
                        {schedulesEnabled && (
                          <Grid xs={12} md={6} item>
                            <Field
                              as={TextField}
                              label={i18n.t(
                                "queueModal.form.outOfHoursMessage"
                              )}
                              type="outOfHoursMessage"
                              multiline
                              rows={5}
                              fullWidth
                              name="outOfHoursMessage"
                              error={
                                touched.outOfHoursMessage &&
                                Boolean(errors.outOfHoursMessage)
                              }
                              helperText={
                                touched.outOfHoursMessage &&
                                errors.outOfHoursMessage
                              }
                              variant="outlined"
                              margin="dense"
                            />
                          </Grid>
                        )}
                      </Grid>
                    </div>

                    {/* <Typography variant="subtitle1">
                      Opções
                      <CustomToolTip
                        title="Adicione opções para construir um chatbot"
                        content="Se houver apenas uma opção, ela será escolhida automaticamente, fazendo com que o bot responda com a mensagem da opção e siga adiante"
                      >
                        <HelpOutlineOutlinedIcon
                          style={{ marginLeft: "14px" }}
                          fontSize="small"
                        />
                      </CustomToolTip>
                    </Typography> */}

                    <div>
                      <FieldArray name="chatbots">
                        {({ push, remove }) => (
                          <>
                            <Stepper
                              nonLinear
                              activeStep={activeStep}
                              orientation="vertical"
                            >
                              {values.chatbots &&
                                values.chatbots.length > 0 &&
                                values.chatbots.map((info, index) => (
                                  <Step
                                    key={`${info.id ? info.id : index}-chatbots`}
                                    onClick={() => setActiveStep(index)}
                                  >
                                    <StepLabel key={`${info.id}-chatbots`}>
                                      {isNameEdit !== index &&
                                        queue.chatbots[index]?.name ? (
                                        <div
                                          className={classes.greetingMessage}
                                          variant="body1"
                                        >
                                          {values.chatbots[index].name}

                                          <IconButton
                                            size="small"
                                            onClick={() => {
                                              setIsNamedEdit(index);
                                              setIsStepContent(false);
                                            }}
                                          >
                                            <EditIcon />
                                          </IconButton>

                                          <IconButton
                                            onClick={() => {
                                              setSelectedQueue(info);
                                              setConfirmModalOpen(true);
                                            }}
                                            size="small"
                                          >
                                            <DeleteOutline />
                                          </IconButton>
                                        </div>
                                      ) : (
                                        <>
                                          <Field
                                            as={TextField}
                                            name={`chatbots[${index}].name`}
                                            variant="standard"
                                            color="primary"
                                            disabled={isSubmitting}
                                            autoFocus
                                            error={
                                              touched?.chatbots?.[index]?.name &&
                                              Boolean(
                                                errors.chatbots?.[index]?.name
                                              )
                                            }
                                            className={classes.textField}
                                          />

                                          <FormControlLabel
                                            control={
                                              <Field
                                                as={Switch}
                                                color="primary"
                                                name={`chatbots[${index}].isAgent`}
                                                checked={
                                                  values.chatbots[index].isAgent ||
                                                  false
                                                }
                                              />
                                            }
                                            label="Atendente.."
                                          />
                                          {console.log('values.chatbots[index].optionType/*\\', values.chatbots[index].optionType)}
                                          {
                                            !values.chatbots[index].isAgent && (
                                              <FormControlLabel
                                                control={
                                                  <Field
                                                    as={Switch}
                                                    color="primary"
                                                    name={`chatbots[${index}].optionType`}
                                                    type="checkbox"
                                                    onChange={() => handleOptionChangeType(values, index)}
                                                    checked={values.chatbots[index].optionType === 'file'}
                                                  />
                                                }
                                                label="Arquivo"
                                              />
                                            )
                                          }
                                          {values.chatbots[index].optionType === 'file' ? (
                                            <>
                                              <input
                                                accept="image/*,application/pdf"
                                                className={classes.input}
                                                id="file"
                                                type="file"
                                                name="file"
                                                onChange={handleSetFile}
                                              />
                                              {console.log(values)}
                                              <IconButton size="small" onClick={() => handleSaveFile(values.chatbots[index])} component="span">
                                                <Send />
                                              </IconButton>
                                              {makeFileLink(values.chatbots[index], values.companyId) !== '' && (<><Link style={{marginLeft: 20}} href={makeFileLink(values.chatbots[index], values.companyId)} target="_blank">Arquivo atual</Link><br/></>)}<br/>
                                              <br/>
                                            </>
                                          ) : (
                                            <>
                                              <br />
                                              <FormControlLabel
                                                control={
                                                  <Field
                                                    as={TextField}
                                                    type="greetingMessage"
                                                    placeholder="Mensagem"
                                                    fullWidth
                                                    variant="outlined"
                                                    multiline
                                                    style={{ minWidth: "400px", width: "100%", marginLeft: "20px" }}
                                                    margin="dense"
                                                    color="primary"
                                                    name={`chatbots[${index}].greetingMessage`}
                                                    // onChange={() => handleOptionChangeType(values, index)}
                                                    // checked={values.chatbots[index].optionType === 'file'}
                                                  />
                                                }
                                                label=""
                                              />
                                            </>
                                          )}

                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              values.chatbots[index].name
                                                ? handleSaveBot(values)
                                                : null
                                            }
                                            disabled={isSubmitting}
                                          >
                                            <SaveIcon />
                                          </IconButton>

                                          <IconButton
                                            size="small"
                                            onClick={() => remove(index)}
                                            disabled={isSubmitting}
                                          >
                                            <DeleteOutline />
                                          </IconButton>
                                        </>
                                      )}
                                    </StepLabel>

                                    {isStepContent && queue.chatbots[index] && (
                                      <StepContent>
                                        <>
                                          {isGreetingMessageEdit !== index ? (
                                            <div
                                              className={classes.greetingMessage}
                                            >
                                              <Typography
                                                color="textSecondary"
                                                variant="body1"
                                              >
                                                Message:
                                              </Typography>

                                              {
                                                values.chatbots[index]
                                                  .greetingMessage
                                              }

                                              {!queue.chatbots[index]
                                                ?.greetingMessage && (
                                                  <CustomToolTip
                                                    title="A mensagem é obrigatória para passar para o próximo nível."
                                                    content="Se a mensagem não estiver definida, o bot não o seguirá."
                                                  >
                                                    <HelpOutlineOutlinedIcon
                                                      color="secondary"
                                                      style={{ marginLeft: "4px" }}
                                                      fontSize="small"
                                                    />
                                                  </CustomToolTip>
                                                )}

                                              <IconButton
                                                size="small"
                                                onClick={() =>
                                                  setGreetingMessageEdit(index)
                                                }
                                              >
                                                <EditIcon />
                                              </IconButton>
                                            </div>
                                          ) : (
                                            <div
                                              className={classes.greetingMessage}
                                            >
                                              <Field
                                                as={TextField}
                                                name={`chatbots[${index}].greetingMessage`}
                                                variant="standard"
                                                margin="dense"
                                                fullWidth
                                                multiline
                                                error={
                                                  touched.greetingMessage &&
                                                  Boolean(errors.greetingMessage)
                                                }
                                                helperText={
                                                  touched.greetingMessage &&
                                                  errors.greetingMessage
                                                }
                                                className={classes.textField}
                                              />

                                              <IconButton
                                                size="small"
                                                onClick={() =>
                                                  handleSaveBot(values)
                                                }
                                                disabled={isSubmitting}
                                              >
                                                {" "}
                                                <SaveIcon />
                                              </IconButton>
                                            </div>
                                          )}

                                          <OptionsChatBot chatBotId={info.id} />
                                        </>
                                      </StepContent>
                                    )}
                                  </Step>
                                ))}

                              <Step>
                                <StepLabel style={{ cursor: "pointer", width: '100%' }}
                                  onClick={() => push({ name: "", value: "" })}>
                                  Adicionar opções...
                                </StepLabel>
                              </Step>
                            </Stepper>
                          </>
                        )}
                      </FieldArray>
                    </div>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={handleClose}
                      // color="secondary"
                      disabled={isSubmitting}
                    // variant="outlined"
                    >
                      {i18n.t("queueModal.buttons.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      disabled={isSubmitting}
                      variant="contained"
                      className={classes.btnWrapper}
                    >
                      {queueId
                        ? `${i18n.t("queueModal.buttons.okEdit")}`
                        : `${i18n.t("queueModal.buttons.okAdd")}`}
                      {isSubmitting && (
                        <CircularProgress
                          size={24}
                          className={classes.buttonProgress}
                        />
                      )}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </Paper>
        )}
        {tab === 1 && (
          <Paper style={{ padding: 20 }}>
            <SchedulesForm
              loading={false}
              onSubmit={handleSaveSchedules}
              initialValues={schedules}
              labelSaveButton="Adicionar"
            />
          </Paper>
        )}
      </Dialog>
    </div>
  );
};

export default QueueModal;
