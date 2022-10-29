import { PlayerDto } from "../../players/dtos/playerDto.dto";

export class TableDto {
  tableNumber: number;
  players: PlayerDto[];
  roundNumber: number;
  matchStatus: string;
  votes?: [{ voter: PlayerDto, vote: PlayerDto }];
}