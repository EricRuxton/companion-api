import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';
import { PlayersModule } from './players/players.module';

// const ormconfig = require('../ormconfig.json');

@Module({
  imports: [ EventsModule, PlayersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
