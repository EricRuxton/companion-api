import { Injectable } from "@nestjs/common";
import { TournamentDto } from "./dtos/tournamentDto.dto";
import { PlayerDto } from "../players/dtos/playerDto.dto";
import { TableDto } from "../tables/dtos/tableDto.dto";

let Tournament: TournamentDto;

export const FULL_TABLE_SEATING = 4;

@Injectable()
export class EventsService {
  constructor() {
  }

  async createEvent(eventCode) {
    Tournament = new TournamentDto();
    Tournament.eventCode = eventCode;
    Tournament.finished = false;
    Tournament.players = [];
    return Tournament;
  }

  async addPlayer(player: PlayerDto) {
    player.points = 0;
    player.matchPoints = 0;
    player.dropped = false;
    if (!Tournament.players) {
      Tournament.players = [player];
    } else {
      if (Tournament.players.filter((p) => p.id == player.id).length == 0)
        Tournament.players.push(player);
    }
    return;
  }

  async getPlayers() {
    if (Tournament) {
      if (Tournament.players)
        return Tournament.players;
    }
  }

  getEvent() {
    return Tournament;
  }

  getEventCode() {
    if (Tournament)
      return { eventCode: Tournament.eventCode, ongoing: Tournament.ongoing };
  }

  deleteEvent() {
    Tournament = null;
  }

  async createTables() {
    if (Tournament) {
      if (Tournament.players) {
        if (Tournament.players.length >= 6 && !Tournament.roundOngoing) {
          if (Tournament.currentRound == Tournament.numberOfRounds) {
            Tournament.finished = true;
          }
          Tournament.roundOngoing = true;
          if (!Tournament.ongoing) {
            Tournament.numberOfRounds = Math.floor(Math.log2(Tournament.players.length));
            Tournament.numberOfPlayers = Tournament.players.length;
            let array = Tournament.players;
            for (let i = array.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [array[i], array[j]] = [array[j], array[i]];
            }
            Tournament.ongoing = true;
          }
          let tables = [];
          Tournament.players.forEach((p) => {
            p.paired = false;
          });
          Tournament.currentRound++;
          let brokeLast = false;
          while (Tournament.players.filter(p => !p.paired).length > 0) {
            if ((Tournament.players.filter(p => !p.paired).length == FULL_TABLE_SEATING ||
                (Tournament.players.filter(p => !p.paired).length - 4 >= 3))
              && !brokeLast) {
              let table: TableDto = {
                players: Tournament.players.filter(p => !p.paired).slice(0, 4),
                tableNumber: tables ? (tables.length + 1) : 1,
                roundNumber: Tournament.currentRound,
                matchStatus: "Ongoing"
              };
              if (tables.length == 0) {
                tables = [table];
              } else {
                tables.push(table);
              }
              brokeLast = false;
            } else if (Tournament.players.filter(p => !p.paired).length % 3 == 0) {
              let table: TableDto = {
                players: Tournament.players.filter(p => !p.paired).slice(0, 3),
                tableNumber: tables ? (tables.length + 1) : 1,
                roundNumber: Tournament.currentRound,
                matchStatus: "Ongoing"
              };
              if (tables.length == 0) {
                tables = [table];
              } else {
                tables.push(table);
              }
              for (let player of table.players) {
                player.paired = true;
              }
              brokeLast = false;
            } else {
              if (tables.length > 0) {
                brokeLast = true;
                let lastTable = tables.pop();
                for (let player of lastTable.players) {
                  player.paired = false;
                }
              }
            }
            for (let table of tables) {
              for (let player of table.players) {
                player.paired = true;
              }
            }
          }
          if (Tournament.currentRound === 1)
            Tournament.tables = [...tables];
          else
            Tournament.tables.push(...tables);
        }
      }
    }
    return {
      currentRound: Tournament.currentRound,
      numberOfRounds: Tournament.numberOfRounds,
      ActiveTables: Tournament.tables.filter((t) => t.roundNumber == Tournament.currentRound)
    };
  }

  getTable(userId) {
    if (Tournament) {
      if (Tournament.roundOngoing) {
        return {
          ...Tournament
            .tables.filter((table) => (table.players.some((player) => player.id == userId) && table.roundNumber == Tournament.currentRound))[0],
          numberOfRounds: Tournament.numberOfRounds,
          tournamentComplete: Tournament.finished
        };
      }
    }
  }

  saveTable(req) {
    if (Tournament) {
      for (let table of Tournament.tables) {
        if (table.tableNumber == req.table.tableNumber) {
          for (let player of table.players) {
            if (player.id == req.userId) {
              player.matchPoints = req.table.players.filter((p) => p.id === req.userId)[0].matchPoints;
            }
          }
        }
      }
      return this.getTable(req.userId);
    }
  }

  submitTable(TTS: TableDto) {
    for (let table of Tournament.tables) {
      if (table.tableNumber == TTS.tableNumber && table.roundNumber == Tournament.currentRound) {
        let winners = [];
        for (let player of table.players) {
          if (table.votes) {
            let votes = table.votes.filter((v) => v.vote != null);
            player.votes = votes.filter((v) => v.vote.id == player.id).length;
          }
          if (winners.length == 0) {
            winners.push(player);
          } else {
            if (winners[0].votes == player.votes) {
              winners.push(player);
            } else if (player.votes > winners[0].votes) {
              winners = [];
              winners.push(player);
            }
          }
        }
        if (winners.length == 1) {
          for (let player of table.players) {
            if (player.id == winners[0].id) {
              player.matchPoints++;
            }
          }
        }
        table.matchStatus = "Completed";
      }
    }
    return Tournament;
  }

  markTableComplete(TTS: TableDto) {
    for (let table of Tournament.tables) {
      if (table.tableNumber == TTS.tableNumber && table.roundNumber == Tournament.currentRound) {
        table.matchStatus = "Voting";
      }
    }
  }

  submitVote(vote: PlayerDto, tableNumber: number, voter: PlayerDto) {
    for (let table of Tournament.tables) {
      if (table.tableNumber == tableNumber && table.roundNumber == Tournament.currentRound) {
        if (table.votes == null) {
          table.votes = [{ voter, vote }];
        } else {
          table.votes.push({ voter, vote });
        }
        for (let player of table.players) {
          if (player.id === voter.id) player.voteSubmitted = true;
        }
        console.log({ votes: table.votes.length, mobilePLayers: table.players.filter((p) => p.mobileUser).length });
        if (table.votes.length == table.players.filter((p) => p.mobileUser).length) {
          this.submitTable(table);
        }
      }
    }
  }

  async generateNextRound() {
    for (let table of Tournament.tables) {
      for (let matchPlayer of table.players) {
        for (let player of Tournament.players) {
          if (player.id == matchPlayer.id) {
            player.points += matchPlayer.matchPoints;
            player.votes = 0;
            player.voteSubmitted = false;
            player.paired = false;
            player.matchPoints = 0;
          }
        }
      }
    }
    Tournament.players = Tournament.players.sort((p1, p2) => p1.points < p2.points ? 1 : -1).filter((p) => !p.dropped);
    Tournament.roundOngoing = false;
    console.log(Tournament);
    this.createTables().then(() => {
      console.log(Tournament);
    });
  }

  removePlayer(PTR: PlayerDto) {
    Tournament.players = Tournament.players.filter((p) => p.id != PTR.id);
    return Tournament.players;
  }

  dropPlayer(PTD: PlayerDto, pTable) {
    for (let table of Tournament.tables) {
      if (table.tableNumber == pTable.tableNumber && table.roundNumber == Tournament.currentRound) {
        for (let player of table.players) {
          if (player.id == PTD.id) {
            player.dropped = !player.dropped;
          }
        }
      }
    }
  }

  standings() {
    return Tournament.players;
  }

}
