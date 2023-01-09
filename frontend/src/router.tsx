import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Main from "./Main";
import Feed from "./Feed";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Main />,
      },
      {
        path: "/feed",
        element: <Feed />,
      },
    ],
  },
]);
