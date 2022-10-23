import { Injectable } from '@nestjs/common';
import { PlayerDto } from './dtos/playerDto.dto';

let ActivePlayers: PlayerDto[];

@Injectable()
export class PlayersService {
  constructor() {}
}
