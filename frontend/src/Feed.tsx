import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useSubscribeGames } from "./useSubscribeGames";
import { useSubscribePlayers } from "./useSubscribePlayers";

export default function Feed() {
  const [gameId, setGameId] = useState<string | null>(null);

  const { data } = useSubscribeGames();
  const players = useSubscribePlayers();

  const handleOnClick = (id: string | null) => {
    players.gameId(id);
    setGameId(id);
  };

  const handleOnClose = () => {
    players.gameId(null);
    setGameId(null);
  };

  return (
    <Box>
      <Typography variant="h2">Feed</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell align="right">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map(({ id, status }) => (
              <TableRow
                key={id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleOnClick(id)}
                >
                  {id}
                </TableCell>
                <TableCell align="right">{status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {gameId && (
        <>
          <h2>Game {gameId}</h2>
          <Button onClick={handleOnClose}>Close</Button>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell align="right">Age</TableCell>
                  <TableCell align="right">Assists</TableCell>
                  <TableCell align="right">Goals</TableCell>
                  <TableCell align="right">Hits</TableCell>
                  <TableCell align="right">Points</TableCell>
                  <TableCell align="right">Penality in Mins</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {players.data.map(
                  ({
                    id,
                    playerName,
                    team,
                    playerAge,
                    assists,
                    goals,
                    hits,
                    points,
                    penalityInMinutes,
                  }) => (
                    <TableRow
                      key={id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {playerName}
                      </TableCell>
                      <TableCell>{team}</TableCell>
                      <TableCell align="right">{playerAge}</TableCell>
                      <TableCell align="right">{assists}</TableCell>
                      <TableCell align="right">{goals}</TableCell>
                      <TableCell align="right">{hits}</TableCell>
                      <TableCell align="right">{points}</TableCell>
                      <TableCell align="right">{penalityInMinutes}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}
