
import { createRoot } from "react-dom/client";
import { AppRouterProvider } from "./app/router";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(<AppRouterProvider />);
  