import React, { useEffect, useState, useContext } from "react";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from "@material-ui/core/TextField";
import Title from "../Title";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { ToastContainer, toast } from 'react-toastify';
import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import { Tabs, Tab } from "@material-ui/core";
import api from "../../services/api";
import { head } from "lodash";
import useSettings from "../../hooks/useSettings";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  // ... (seu código de estilo)

  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
}));

const SuaComponente = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { settings, loadSettings } = useSettings();

  const [urlTypeBot, setUrlTypeBot] = useState("");
  const [apiKeyTypeBot, setApiKeyTypeBot] = useState("");

  useEffect(() => {
    // Carregue as configurações quando o componente montar
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    // Busque os valores específicos que você precisa
    const urlTypeBotSetting = settings.find((s) => s.key === "urlTypeBot");
    const apiKeyTypeBotSetting = settings.find((s) => s.key === "apiKeyTypeBot");

    // Se encontrou os valores, atualize os estados
    if (urlTypeBotSetting) {
      setUrlTypeBot(urlTypeBotSetting.value);
    }

    if (apiKeyTypeBotSetting) {
      setApiKeyTypeBot(apiKeyTypeBotSetting.value);
    }
  }, [settings]);

  // ... Restante do seu código ...

  return (
    // JSX do seu componente
    <div>
      {/* ... seu JSX aqui ... */}
    </div>
  );
};

export default SuaComponente;