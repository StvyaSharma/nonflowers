import { mountApp } from "./app";
import "../style.css";
import "dialkit/vanilla/styles.css";

const dispose = mountApp();
if (import.meta.hot) import.meta.hot.dispose(dispose);
