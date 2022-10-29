import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { EventsService } from "./events.service";
import { PlayerDto } from "../players/dtos/playerDto.dto";
import { TableDto } from "../tables/dtos/tableDto.dto";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {
  }

  @Get()
  getEvent() {
    return this.eventsService.getEvent();
  }

  @Get("getEventCode")
  getEventCode() {
    return this.eventsService.getEventCode();
  }

  @Post()
  createEvent(@Body("eventCode") eventCode: string) {
    return this.eventsService.createEvent(eventCode);
  }

  @Post("saveTable")
  saveTable(@Body() req) {
    return this.eventsService.saveTable(req);
  }

  @Post("submitTable")
  submitTable(@Body("table") table: TableDto) {
    return this.eventsService.submitTable(table);
  }

  @Post("addPlayer")
  addEventPlayer(@Body() req: PlayerDto) {
    return this.eventsService.addPlayer(req);
  }

  @Get("players")
  getEventPlayers() {
    return this.eventsService.getPlayers();
  }

  @Delete()
  deleteEvent() {
    return this.eventsService.deleteEvent();
  }

  @Get("tables")
  getTables() {
    return this.eventsService.createTables();
  }

  @Get("table/:userId")
  getPlayerTable(@Param("userId") userId: string) {
    return this.eventsService.getTable(userId);
  }

  @Post("markTableComplete")
  markTableComplete(@Body("table") table: TableDto) {
    return this.eventsService.markTableComplete(table);
  }

  @Post("submitVote")
  submitVote(@Body("vote") vote: PlayerDto,
             @Body("tableNumber") tableNumber: number,
             @Body("voter") voter: PlayerDto
  ) {
    return this.eventsService.submitVote(vote, tableNumber, voter);
  }

  @Post("generateNextRound")
  generateNextRound() {
    return this.eventsService.generateNextRound();
  }

  @Post("removePlayer")
  removePlayer(@Body("player") player: PlayerDto) {
    return this.eventsService.removePlayer(player);
  }

  @Post("dropPlayer")
  dropPlayer(@Body("player") player: PlayerDto,
             @Body("table") table: TableDto) {
    return this.eventsService.dropPlayer(player, table);
  }

  @Get("standings")
  standings() {
    return this.eventsService.standings();
  }
}
