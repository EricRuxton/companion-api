import { Body, Controller, Get, Post } from '@nestjs/common';
import { EventsService } from './events.service';
import { PlayerDto } from '../players/dtos/playerDto.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  createEvent(@Body('eventCode') eventCode: string) {
    return this.eventsService.createEvent(eventCode);
  }

  @Post('addPlayer')
  addEventPlayer(@Body() req: PlayerDto) {
    return this.eventsService.addPlayer(req);
  }

  @Get('players')
  getEventPlayers() {
    return this.eventsService.getPlayers();
  }
}
