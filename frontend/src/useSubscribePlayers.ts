import { useEffect, useState } from "react";
import axios from "axios";

export const useSubscribePlayers = () => {
  const [data, setData] = useState([]);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const event = new EventSource(`/api/subscribePlayers/${id}`, {
      withCredentials: false,
    });

    if (!id) {
      event.close();
      return;
    }

    (async () => {
      const res = await axios.get(`/api/players/${id}`);
      setData(res.data);
    })();

    event.onmessage = (e) => {
      setData(JSON.parse(e.data));
    };

    return () => {
      event.close();
    };
  }, [id]);

  return {
    data,
    gameId: setId,
  };
};
