import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Button,
  Divider,
  InputAdornment,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import {
  GetApp,
} from "@material-ui/icons";
import ModalImageCors from "../../components/ModalImageCors";
import SendIcon from "@material-ui/icons/Send";
import AttachFileIcon from "@material-ui/icons/AttachFile";

import { head } from "lodash";

import LinearWithValueLabel from "../../components/MessageInputCustom/ProgressBarCustom";

import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflow: "hidden",
    borderRadius: 0,
    height: "100%",
    borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
  },
  messageList: {
    position: "relative",
    overflowY: "auto",
    height: "100%",
    ...theme.scrollbarStyles,
  },
  inputArea: {
    position: "relative",
    height: "auto",
  },
  input: {
    padding: "20px",
  },
  buttonSend: {
    margin: theme.spacing(1),
  },
  boxLeft: {
    padding: "10px 10px 5px",
    margin: "10px",
    position: "relative",
    maxWidth: 300,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    border: "1px solid rgba(0, 0, 0, 0.12)",
  },
  boxRight: {
    padding: "10px 10px 5px",
    margin: "10px 10px 10px auto",
    position: "relative",
    textAlign: "right",
    maxWidth: 300,
    borderRadius: 10,
    borderBottomRightRadius: 0,
    border: "1px solid rgba(0, 0, 0, 0.12)",
  },
  downloadMedia: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "inherit",
    padding: 10,
  },
  sendMessageIcons: {
    color: "grey",
  },
  uploadInput: {
    display: "none",
  },
  messageMedia: {
		objectFit: "cover",
		width: 250,
		height: 200,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
	},
  tst:{
    
  }
}));

const checkMessageMedia = (message, classes) => {

  if (message.mediaName.includes('.PNG') || message.mediaName.includes('.JPEG')) {
    return <ModalImageCors imageUrl={message.mediaPath} />;
  }
  if (message.mediaType === "audio") {
    return (
      <audio controls>
        <source src={message.mediaPath} type="audio/ogg"></source>
      </audio>
    );  
  }

  if (message.mediaName.includes('.mp4') || message.mediaName.includes('.mkv')) {
    return (
      <video
        className={classes.messageMedia}
        src={message.mediaPath}
        controls
      />
    );
  } else {
    return (
      <>
        <div className={classes.downloadMedia}>
          <a
            href={message.mediaPath}  // Use the mediaPath directly as the download link
            download  // Add the download attribute to indicate it's a download link
          >
            <Button startIcon={<GetApp />} color="primary" variant="outlined">
              Download
            </Button>
          </a>
        </div>
        <Divider />
      </>
    );
  }
}

const MessageBox = ({ item, isCurrentUser }) => {
  const classes = useStyles();
  const { datetimeToClient } = useDate(); 
  const boxStyles = isCurrentUser ? classes.boxRight : classes.boxLeft;

  return (
    <Box key={item.id} className={boxStyles}>
    <Typography variant="subtitle2">{item.sender.name}</Typography>
    <Typography variant="body2">
      {item.message.split('\r\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < item.message.split('\r\n').length - 1 && <br />}
        </React.Fragment>
      ))}
    </Typography>
    {item.mediaPath && checkMessageMedia(item, classes)}
    <Typography variant="caption" display="block">
      {datetimeToClient(item.createdAt)}
    </Typography>
  </Box>
);
};

const ChatMessages = ({
  chat,
  messages,
  handleSendMessage: propHandleSendMessage,
  handleLoadMore: propHandleLoadMore,
  scrollToBottomRef,
  pageInfo,
  loading,
}) => {
  const classes = useStyles();
  const [medias, setMedias] = useState(null);
  const [percentLoading, setPercentLoading] = useState(0);
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const baseRef = useRef();

  const [contentMessage, setContentMessage] = useState("");

  const scrollToBottom = useCallback(() => {
    if (baseRef.current) {
      baseRef.current.scrollIntoView({});
    }
  }, []);

  const unreadMessages = useCallback((chat) => {
    if (chat !== undefined) {
      const currentUser = chat.users.find((u) => u.userId === user.id);
      return currentUser.unreads > 0;
    }
    return 0;
  }, [user.id]);

  useEffect(() => {
    if (unreadMessages(chat) > 0) {
      try {
        api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    }
    scrollToBottomRef.current = scrollToBottom;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat, scrollToBottom]);

  const handleScroll = useCallback((e) => {
    const { scrollTop } = e.currentTarget;
    if (!pageInfo.hasMore || loading) return;
    if (scrollTop < 600) {
      propHandleLoadMore();
    }
  }, [pageInfo.hasMore, loading, propHandleLoadMore]);

  const FileInput = ({ handleChangeMedias }) => {
    const classes = useStyles();
    return (
      <>
        <input
          multiple
          type="file"
          id="upload-button"
          className={classes.uploadInput}
          onChange={handleChangeMedias}
        />
        <label htmlFor="upload-button">
          <IconButton aria-label="upload" component="span">
            <AttachFileIcon className={classes.sendMessageIcons} />
          </IconButton>
        </label>
      </>
    );
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files[0]) {
      return;
    }

    const selectedMedias = head(e.target.files);
    setMedias(selectedMedias);
  };

  const handleSendMessage = useCallback(() => {
    // If both contentMessage and medias are empty, return early
    if (contentMessage.trim() === "" && !medias) {
      return;
    }
  
    // Send the message with content and/or media
    propHandleSendMessage(contentMessage, medias);
    setContentMessage("");
    setMedias(null);
  }, [contentMessage, medias, propHandleSendMessage]);

  return (
    <Paper className={classes.mainContainer}>
      <div onScroll={handleScroll} className={classes.messageList}>
        {Array.isArray(messages) &&
          messages.map((item, key) => (
            <MessageBox key={key} item={item} isCurrentUser={item.senderId === user.id}/>
          ))}
        <div ref={baseRef}></div>
      </div>
      <div className={classes.inputArea}>
        <FormControl variant="outlined" fullWidth>
          <Input
            multiline
            value={contentMessage}
            onKeyUp={(e) => {
              if (e.key === "Enter" && contentMessage.trim() !== "") {
                // If Shift key is pressed, add a line break; otherwise, send the message
                if (!e.shiftKey) {
                  handleSendMessage(contentMessage);
                } else {
                  setContentMessage((prevContent) => prevContent);
                }
              }
            }}
            onChange={(e) => setContentMessage(e.target.value)}
            className={classes.input}
            endAdornment={
              <InputAdornment position="end">
                <FileInput handleChangeMedias={handleChangeMedias} />
                {loading ? (
                  <div>
                    <LinearWithValueLabel progress={percentLoading} />
                  </div>
                ) : (
                  <span>{medias?.name}</span>
                )}
                <IconButton
                  onClick={handleSendMessage}
                  className={classes.buttonSend}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </div>
    </Paper>
  );
};

export default ChatMessages;
