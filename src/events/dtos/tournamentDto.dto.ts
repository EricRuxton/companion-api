import { PlayerDto } from '../../players/dtos/playerDto.dto';

export class TournamentDto {
  eventCode: string;
  numberOfPlayers: number;
  numberOfRounds: number;
  players: PlayerDto[];
}
