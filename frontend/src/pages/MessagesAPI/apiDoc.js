import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Typography, Button, Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
  },
  code: {
    backgroundColor: theme.palette.type === 'dark' ? '#333' : '#f4f4f4',
    padding: theme.spacing(1),
    borderRadius: 4,
    marginBottom: theme.spacing(1),
    overflowX: 'auto',
    fontFamily: 'monospace',
    color: theme.palette.type === 'dark' ? '#fff' : '#333',
    whiteSpace: 'pre-wrap',
  },
}));

const CurlEmbed = ({ route }) => {
  const classes = useStyles();
  const [copied, setCopied] = useState(false);

  const getCurlCommand = () => {
    switch (route) {
      case 'linkPdf':
        return `curl -X POST http://sua-api.com/api/messages/send/linkPdf \
          -H "Authorization: Bearer SEU_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{ "newContact": { "number": "NUMERO_DO_CONTATO" }, "whatsappId": "ID_DO_WHATSAPP", "msdelay": "TEMPO_DE_ATRASO_EM_MILISEGUNDOS", "url": "URL_DO_PDF", "caption": "LEGENDA_DO_PDF" }'`;
      case 'linkImage':
        return `curl -X POST http://sua-api.com/api/messages/send/linkImage \
          -H "Authorization: Bearer SEU_TOKEN" \
          -H "Content-Type: application/json" \
          -d '{ "newContact": { "number": "NUMERO_DO_CONTATO" }, "whatsappId": "ID_DO_WHATSAPP", "msdelay": "TEMPO_DE_ATRASO_EM_MILISEGUNDOS", "url": "URL_DA_IMAGEM", "caption": "LEGENDA_DA_IMAGEM" }'`;
      default:
        return '';
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const curlCommand = getCurlCommand();

  if (!curlCommand) {
    return null;
  }

  return (
    <Paper className={classes.paper}>
      <Typography variant="subtitle2">Exemplo de comando curl:</Typography>
      <div className={classes.code}>{curlCommand}</div>
      <CopyToClipboard text={curlCommand} onCopy={handleCopy}>
        <Button variant="contained" color="primary" size="small">
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
      </CopyToClipboard>
    </Paper>
  );
};

export default CurlEmbed;
