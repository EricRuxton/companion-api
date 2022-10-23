import { Body, Controller, Get, Post } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayerDto } from './dtos/playerDto.dto';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  addPlayer(@Body() req: PlayerDto) {
    // return this.playersService.addPlayer(req);
  }

  @Get()
  getPlayers() {
    // return this.playersService.getPlayers();
  }
}
