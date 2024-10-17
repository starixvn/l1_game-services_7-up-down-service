import { asClass, asValue } from "awilix";
import { Core } from "sc-game-base";
import { RoundResultConsumer, SettleGameRoundConsumer } from "./consumers";
import { Bot, GameCron } from "./crons";
import { betLogs, bets, results, rounds } from "./models";
import HttpRouter from "./routers/http-router";

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
        });
    }

    registerRouters() {
        super.registerRouters();

        this.container.register({
            httpRouter: asClass(HttpRouter),
        });
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            settleGameRoundConsumer: asClass(SettleGameRoundConsumer).singleton().proxy(),
            roundResultConsumer: asClass(RoundResultConsumer).singleton(),
        });
    }
}
