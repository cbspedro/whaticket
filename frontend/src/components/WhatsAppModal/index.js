import React, { useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import UniqueQueueSelect from "../QueueSelect/uniqueQueueSelect";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  CircularProgress,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
} from "@material-ui/core";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    gap: 4,
  },

  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
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
}));

const SessionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  maxUseBotQueues: Yup.string().required("Required"),
});

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {
  const inputFileRef = useRef(null);

  const [attachment, setAttachment] = useState(null);
  const [attachmentName, setAttachmentName] = useState("");

  const classes = useStyles();
  const initialState = {
    name: "",
    greetingMessage: "",
    complationMessage: "",
    outOfHoursMessage: "",
    ratingMessage: "",
    isDefault: false,
    token: "",
    maxUseBotQueues: "",
    provider: "beta",
    expiresTicket: 0,
  };
  const [whatsApp, setWhatsApp] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [selectedQueueId, setSelectedQueueId] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {
        const { data } = await api.get(`whatsapp/${whatsAppId}?session=0`);
        setWhatsApp(data);
        try {
          setAttachmentName(JSON.parse(data.greetingMediaAttachment));
        } catch (err) {
          setAttachmentName([data.greetingMediaAttachment]);
        }

        const whatsQueueIds = data.queues?.map((queue) => queue.id);
        setSelectedQueueId(data.maxUseBotQueueId)
        setSelectedQueueIds(whatsQueueIds);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, [whatsAppId]);

  const handleSaveWhatsApp = async (values) => {
    const whatsappData = { ...values, queueIds: selectedQueueIds, maxUseBotQueueId: selectedQueueId};
    delete whatsappData["queues"];
    delete whatsappData["session"];
    const localAttachmentName = attachmentName;
    if (attachment != null) {
      localAttachmentName.push(attachment.name);
    }
    whatsappData.greetingMediaAttachment = JSON.stringify(localAttachmentName);

    try {
      console.log("attachment", attachment);
      console.log("whatsappData", whatsappData);
      if (whatsAppId) {
        await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/whatsapp/${whatsAppId}/media-upload`, formData);
        }
        if (!attachmentName && whatsApp.greetingMediaAttachment !== null) {
          //await api.delete(`/whatsapp/${whatsAppId}/media-upload`);
        }
      } else {
        const { data } = await api.post("/whatsapp", whatsappData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          //await api.post(`/whatsapp/${data.id}/media-upload`, formData);
        }
      }
      toast.success(i18n.t("whatsappModal.success"));
      handleClose();
    } catch {}
  };

  const handleClose = () => {
    onClose();
    try {
      setWhatsApp(initialState);
      inputFileRef.current.value = null;
      setAttachment(null);
    } catch (error) {

    }
  };

  const handleFileUpload = () => {
    const file = inputFileRef.current.files[0];
    setAttachment(file);
    let currentAttachment = attachmentName;
    if (currentAttachment) {
      currentAttachment.push(file.name);
    } else {
      currentAttachment = [file.name];
    }
    setAttachmentName(currentAttachment);
    inputFileRef.current.value = null;
  };

  const handleDeleFile = (index) => {
    const currentAttachment =
      attachmentName instanceof Array ? attachmentName : [attachmentName];
    currentAttachment.splice(index, 1);
    console.log("currentAttachment", currentAttachment);
    setAttachment(null);
    setAttachmentName([...currentAttachment]);
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {whatsAppId
            ? i18n.t("whatsappModal.title.edit")
            : i18n.t("whatsappModal.title.add")}
        </DialogTitle>
        <Formik
          initialValues={whatsApp}
          enableReinitialize={true}
          validationSchema={SessionSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveWhatsApp(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, touched, errors, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                {/* NOME E PADRAO */}
                <div className={classes.multFieldLine}>
                  <Grid spacing={2} container>
                    <Grid item>
                      <Field
                        as={TextField}
                        label={i18n.t("whatsappModal.form.name")}
                        autoFocus
                        name="name"
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                        variant="outlined"
                        margin="dense"
                        className={classes.textField}
                      />
                    </Grid>
                    <Grid style={{ paddingTop: 15 }} item>
                      <FormControlLabel
                        control={
                          <Field
                            as={Switch}
                            color="primary"
                            name="isDefault"
                            checked={values.isDefault}
                          />
                        }
                        label={i18n.t("whatsappModal.form.default")}
                      />
                    </Grid>
                    {/*<Grid item>
                      <Field
                        as={TextField}
                        label={"Encerrar chat após x horas"}
                        name="expiresTicket"
                        error={
                          touched.expiresTicket && Boolean(errors.expiresTicket)
                        }
                        helperText={
                          touched.expiresTicket && errors.expiresTicket
                        }
                        variant="outlined"
                        margin="dense"
                        className={classes.textFieldTime}
                      />
                      </Grid>*/}
                  </Grid>
                </div>
                {attachmentName && (
                  <>
                    {attachmentName?.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          flexDirection: "row-reverse",
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="primary"
                          endIcon={<DeleteOutlineIcon />}
                          onClick={() => handleDeleFile(index)}
                        >
                          {file}
                        </Button>
                      </div>
                    ))}
                  </>
                )}

                {/* MENSAGEM DE SAUDAÇÃO */}
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.greetingMessage")}
                    type="greetingMessage"
                    multiline
                    minRows={4} // Usando a propriedade sugerida `minRows`
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
                </div>
                {/*<div
                  style={{ display: "flex", flexDirection: "column-reverse" }}
                >
                  <label
                    htmlFor="fileUpload"
                    style={{
                      cursor: "pointer",
                      color: "blue",
                      textDecoration: "underline",
                    }}
                  >
                    Escolher arquivo
                  </label>
                  <input
                    type="file"
                    accept="video/*,image/*,audio/*"
                    id="fileUpload"
                    ref={inputFileRef}
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                  />
                </div>*/}

                {/* MENSAGEM DE CONCLUSÃO */}
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.complationMessage")}
                    type="complationMessage"
                    multiline
                    minRows={4}
                    fullWidth
                    name="complationMessage"
                    error={
                      touched.complationMessage &&
                      Boolean(errors.complationMessage)
                    }
                    helperText={
                      touched.complationMessage && errors.complationMessage
                    }
                    variant="outlined"
                    margin="dense"
                  />
                </div>

                {/* MENSAGEM DE FORA DE EXPEDIENTE */}
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.outOfHoursMessage")}
                    type="outOfHoursMessage"
                    multiline
                    minRows={4}
                    fullWidth
                    name="outOfHoursMessage"
                    error={
                      touched.outOfHoursMessage &&
                      Boolean(errors.outOfHoursMessage)
                    }
                    helperText={
                      touched.outOfHoursMessage && errors.outOfHoursMessage
                    }
                    variant="outlined"
                    margin="dense"
                  />
                </div>

                {/* TOKEN */}
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.token")}
                    type="token"
                    fullWidth
                    name="token"
                    variant="outlined"
                    margin="dense"
                  />
                </div>

                {/* QUANTIDADE MÁXIMA DE VEZES QUE O CHATBOT VAI SER ENVIADO */}
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.maxUseBotQueues")}
                    type="number" // Defina o tipo como "number" para aceitar apenas números
                    fullWidth
                    name="maxUseBotQueues"
                    variant="outlined"
                    margin="dense"
                    error={
                      touched.maxUseBotQueues && Boolean(errors.maxUseBotQueues)
                    }
                    helperText={
                      touched.maxUseBotQueues && errors.maxUseBotQueues
                    }
                  />
                </div>

                <div>
                  <UniqueQueueSelect
                    selectedQueueId={selectedQueueId}
                    onChange={(selectedId) => {
                      setSelectedQueueId(selectedId)
                    }}
                    label={i18n.t("whatsappModal.form.maxUseBotQueuesRedirect")}
                  />
                </div>

                {/* ENCERRAR CHATS ABERTOS APÓS X HORAS */}
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.expiresTicket")}
                    type="expiresTicket"
                    fullWidth
                    name="expiresTicket"
                    variant="outlined"
                    margin="dense"
                    error={
                      touched.expiresTicket && Boolean(errors.expiresTicket)
                    }
                    helperText={touched.expiresTicket && errors.expiresTicket}
                  />
                </div>

                {/*  */}
                <QueueSelect
                  selectedQueueIds={selectedQueueIds}
                  onChange={(selectedIds) => setSelectedQueueIds(selectedIds)}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("whatsappModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {whatsAppId
                    ? i18n.t("whatsappModal.buttons.okEdit")
                    : i18n.t("whatsappModal.buttons.okAdd")}
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
      </Dialog>
    </div>
  );
};

export default React.memo(WhatsAppModal);
