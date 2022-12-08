export class PlayerDto {
  name: string;
  id: string;
  paired: boolean = false;
  email: string;
  points: number = 0;
  matchPoints: number = 0;
  dropped: boolean = false;
  voteSubmitted: boolean = false;
  mobileUser: boolean = false;
  votes: number = 0;
  opponents: OpponentDto[];
  APP: number = 0;
}

export class OpponentDto {
  id: string;
  points: number;
}
