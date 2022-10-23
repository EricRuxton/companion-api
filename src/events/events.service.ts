import { Injectable } from '@nestjs/common';
import { TournamentDto } from './dtos/tournamentDto.dto';
import { PlayerDto } from '../players/dtos/playerDto.dto';

let Tournament: TournamentDto;

@Injectable()
export class EventsService {
  constructor() {}

  async createEvent(eventCode) {
    Tournament = new TournamentDto();
    Tournament.eventCode = eventCode;
    return Tournament;
  }

  async addPlayer(player: PlayerDto) {
    if (!Tournament.players) {
      Tournament.players = [player];
    } else {
      Tournament.players.push(player);
    }
  }

  async getPlayers() {
    return Tournament.players;
  }
}
