import { Injectable } from '@nestjs/common';
import { TournamentDto } from './dtos/tournamentDto.dto';
import { OpponentDto, PlayerDto } from '../players/dtos/playerDto.dto';
import { TableDto } from '../tables/dtos/tableDto.dto';

let Tournament: TournamentDto;

export const FULL_TABLE_SEATING = 4;

export const MANUAL_ENTRANT = {
  id: 'MANUAL ENTRANT',
  NAME: 'MANUAL ENTRANT',
};

@Injectable()
export class EventsService {
  constructor() {}

  async createEvent(eventCode) {
    Tournament = new TournamentDto();
    Tournament.eventCode = eventCode;
    Tournament.finished = false;
    Tournament.players = [];
    return Tournament;
  }

  async addPlayer(player: PlayerDto) {
    player.APP = 0;
    player.points = 0;
    player.matchPoints = 0;
    player.dropped = false;
    player.opponents = [];
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
      if (Tournament.players) return Tournament.players;
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
            Tournament.numberOfRounds = Math.floor(
              Math.log2(Tournament.players.length),
            );
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
          while (Tournament.players.filter((p) => !p.paired).length > 0) {
            if (
              (Tournament.players.filter((p) => !p.paired).length ==
                FULL_TABLE_SEATING ||
                Tournament.players.filter((p) => !p.paired).length - 4 >= 3) &&
              !brokeLast
            ) {
              let table: TableDto = {
                players: Tournament.players
                  .filter((p) => !p.paired)
                  .slice(0, 4),
                tableNumber: tables ? tables.length + 1 : 1,
                roundNumber: Tournament.currentRound,
                matchStatus: 'Ongoing',
              };
              if (tables.length == 0) {
                tables = [table];
              } else {
                tables.push(table);
              }
              brokeLast = false;
            } else if (
              Tournament.players.filter((p) => !p.paired).length % 3 ==
              0
            ) {
              let table: TableDto = {
                players: Tournament.players
                  .filter((p) => !p.paired)
                  .slice(0, 3),
                tableNumber: tables ? tables.length + 1 : 1,
                roundNumber: Tournament.currentRound,
                matchStatus: 'Ongoing',
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
          if (Tournament.currentRound === 1) Tournament.tables = [...tables];
          else Tournament.tables.push(...tables);
        }
      }
    }
    return {
      currentRound: Tournament.currentRound,
      numberOfRounds: Tournament.numberOfRounds,
      ActiveTables: Tournament.tables.filter(
        (t) => t.roundNumber == Tournament.currentRound,
      ),
    };
  }

  getTable(userId) {
    if (Tournament) {
      if (Tournament.roundOngoing) {
        return {
          ...Tournament.tables.filter(
            (table) =>
              table.players.some((player) => player.id == userId) &&
              table.roundNumber == Tournament.currentRound,
          )[0],
          numberOfRounds: Tournament.numberOfRounds,
          tournamentComplete: Tournament.finished,
        };
      }
    }
  }

  saveTable(req) {
    if (Tournament) {
      for (let table of Tournament.tables) {
        if (table.tableNumber == req.table.tableNumber) {
          if (req.userId == null) {
            table.matchStatus = 'Completed';
          } else {
            for (let player of table.players) {
              if (player.id == req.userId) {
                player.matchPoints = req.table.players.filter(
                  (p) => p.id === req.userId,
                )[0].matchPoints;
              }
            }
          }
        }
      }
      return this.getTable(req.userId);
    }
  }

  submitTable(TTS: TableDto) {
    for (let table of Tournament.tables) {
      if (
        table.tableNumber == TTS.tableNumber &&
        table.roundNumber == Tournament.currentRound
      ) {
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
        for (let player of table.players) {
          for (let voteWinner of winners) {
            if (player.id == voteWinner.id) {
              player.matchPoints++;
            }
          }
        }
        table.matchStatus = 'Completed';
      }
    }
    return Tournament;
  }

  setTableVoting(TTS: TableDto) {
    for (let table of Tournament.tables) {
      if (
        table.tableNumber == TTS.tableNumber &&
        table.roundNumber == Tournament.currentRound
      ) {
        for (let player of table.players) player.voteSubmitted = true;
        table.matchStatus = 'Completed';
      }
    }
  }

  submitVote(vote: PlayerDto, tableNumber: number, voter: PlayerDto) {
    for (let table of Tournament.tables) {
      if (
        table.tableNumber == tableNumber &&
        table.roundNumber == Tournament.currentRound
      ) {
        if (table.votes == null) {
          table.votes = [{ voter, vote }];
        } else {
          table.votes.push({ voter, vote });
        }
        for (let player of table.players) {
          if (player.id === voter.id) player.voteSubmitted = true;
        }
      }
    }
  }

  async generateNextRound() {
    for (let table of Tournament.tables) {
      let winners = [];
      for (let player of table.players) {
        if (table.votes) {
          player.votes = table.votes.filter(
            (ballot) => ballot.vote.id == player.id,
          ).length;
          if (winners.length == 0) {
            winners.push(player);
          } else {
            if (player.votes > winners[0].votes) {
              winners = [];
              winners.push(player);
            } else if (player.votes == winners[0].votes) {
              winners.push(player);
            }
          }
        }
      }
      for (let player of table.players) {
        for (let opponent of table.players.filter((p) => p.id != player.id)) {
          if (player.opponents.some((o) => o.id == opponent.id)) {
            for (let oldOpponent of player.opponents) {
              if (oldOpponent.id == opponent.id) {
                oldOpponent.points = opponent.points + opponent.matchPoints;
              }
            }
          } else {
            let newOpponent = new OpponentDto();
            newOpponent.id = opponent.id;
            newOpponent.points = opponent.matchPoints;
            player.opponents.push(newOpponent);
          }
        }
      }
      for (let matchPlayer of table.players) {
        if (winners.some((player) => player.id == matchPlayer.id)) {
          matchPlayer.points++;
        }
        for (let player of Tournament.players) {
          if (player.id == matchPlayer.id) {
            player.points += matchPlayer.matchPoints;
            player.votes = 0;
            player.voteSubmitted = false;
            player.paired = false;
            player.matchPoints = 0;
            player.opponents = matchPlayer.opponents;
          }
        }
      }
    }
    console.log('finished tables');
    for (let player of Tournament.players) {
      for (let opponent of player.opponents) {
        if (
          Tournament.players.filter((player) => player.id == opponent.id)
            .length != 0
        )
          opponent.points = Tournament.players.filter(
            (p) => p.id == opponent.id,
          )[0].points;
      }
    }
    for (let player of Tournament.players) {
      console.log(player.opponents);
      player.APP =
        player.opponents
          .map((o) => o.points)
          .reduce((addend, adder) => addend + adder) / player.opponents.length;
    }
    Tournament.players = Tournament.players
      .sort((p1, p2) => p2.points - p1.points || p2.APP - p1.APP)
      .filter((p) => !p.dropped);
    Tournament.roundOngoing = false;
    await this.createTables();
  }

  removePlayer(PTR: PlayerDto) {
    Tournament.players = Tournament.players.filter((p) => p.id != PTR.id);
    return Tournament.players;
  }

  dropPlayer(PTD: PlayerDto, pTable) {
    for (let table of Tournament.tables) {
      if (
        table.tableNumber == pTable.tableNumber &&
        table.roundNumber == Tournament.currentRound
      ) {
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

  removeVote(req) {
    console.log(req.userId);
    for (let table of Tournament.tables) {
      if (table.tableNumber == req.table.tableNumber) {
        if (
          table.votes &&
          table.votes.filter((ballot) => ballot.vote.id === req.userId).length >
            0
        ) {
          for (let ballot of table.votes) {
            if (ballot.vote.id == req.userId) {
              table.votes = table.votes.filter((vote) => vote != ballot);
              break;
            }
          }
        }
      }
    }
  }

  addVote(req) {
    console.log(req);
    for (let table of Tournament.tables) {
      if (table.tableNumber == req.table.tableNumber) {
        if (table.votes) {
          table.votes.push({
            vote: req.user,
            voter: MANUAL_ENTRANT as unknown as PlayerDto,
          });
        } else {
          table.votes = [];
          table.votes.push({
            vote: req.user,
            voter: MANUAL_ENTRANT as unknown as PlayerDto,
          });
        }
      }
    }
  }
}
