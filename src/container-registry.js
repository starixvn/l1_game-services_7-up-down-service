import { asClass, asValue } from "awilix";
import { Core } from "sc-game-base";
import { GameResultServiceConsumer, RoundResultConsumer, SettleGameRoundConsumer } from "./consumers";
import { Bot, GameCron, ProcessBetQueue } from "./crons";
import { betLogs, bets, results, rounds } from "./models";
import { HttpRouter, SocketRouter } from "./routers";

export default class ContainerRegistry extends Core.ContainerRegistry {
    registerModels() {
        super.registerModels();

        this.container.register({
            roundsRepository: asValue(rounds),
            betsRepository: asValue(bets),
            betLogsRepository: asValue(betLogs),
            resultsRepository: asValue(results),
        });
    }

    registerCrons() {
        super.registerCrons();
        this.container.register({
            bot: asClass(Bot).singleton(),
            gameCron: asClass(GameCron).singleton().proxy(),
            processBetQueue: asClass(ProcessBetQueue).singleton().proxy(),
        });
    }

    registerRouters() {     
        super.registerRouters();

        this.container.register({
            httpRouter: asClass(HttpRouter),
            socketRouter: asClass(SocketRouter).proxy(),
        });
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            settleGameRoundConsumer: asClass(SettleGameRoundConsumer).singleton().proxy(),
            roundResultConsumer: asClass(RoundResultConsumer).singleton(),
            gameResultServiceConsumer: asClass(GameResultServiceConsumer).proxy(),
        }); 
    }
}
