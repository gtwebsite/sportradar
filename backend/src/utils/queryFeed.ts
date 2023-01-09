import axios, { AxiosPromise } from "axios";

// Utility to query feed using axios
export async function queryFeed<T extends {}>(url: string): AxiosPromise<T> {
  return await axios.get<T>(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
