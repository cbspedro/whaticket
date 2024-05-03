import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import * as serviceworker from './serviceWorker';
import App from "./App";

 //Sobrescrevendo as funções do console em ambiente de produção
if (process.env.NODE_ENV === 'production') {
  console.log = console.error = console.warn = () => {};
}

ReactDOM.render(
	<CssBaseline>
		<App />
	</CssBaseline>,
	document.getElementById("root")
);

serviceworker.register()
