import { PlayerDto } from "../../players/dtos/playerDto.dto";
import { TableDto } from "../../tables/dtos/tableDto.dto";

export class TournamentDto {
  eventCode: string;
  numberOfPlayers: number;
  numberOfRounds: number;
  players: PlayerDto[];
  ongoing: boolean = false;
  tables: TableDto[];
  currentRound: number = 0;
  roundOngoing: boolean = false;
  finished: boolean = false;
}
