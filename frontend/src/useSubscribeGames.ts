import { useEffect, useState } from "react";
import axios from "axios";

export const useSubscribeGames = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const event = new EventSource("/api/subscribe", {
      withCredentials: false,
    });

    (async () => {
      const res = await axios.get("/api/all");
      setData(res.data);
    })();

    event.onmessage = (e) => {
      setData(JSON.parse(e.data));
    };

    return () => {
      event.close();
    };
  }, []);

  return {
    data,
  };
};
