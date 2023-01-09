import { useState, useEffect, SyntheticEvent } from "react";
import {
  Box,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
} from "@mui/material";
import axios from "axios";

export default function Main() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await axios.get("/api/liveFeed");
      setIsLoading(false);
      setIsActive(res.data);
    })();
  }, []);

  const handleOnChange = async ({
    currentTarget,
  }: SyntheticEvent<HTMLInputElement>) => {
    const isLiveFeeding = currentTarget.checked;

    setIsActive(isLiveFeeding);

    await axios.post("/api/liveFeedToggle", { isLiveFeeding });
  };

  return (
    <Box>
      <Typography variant="h2">Toggle</Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={isActive}
              disabled={isLoading}
              onChange={handleOnChange}
            />
          }
          label="Enable live feed"
        />
      </FormGroup>
    </Box>
  );
}
