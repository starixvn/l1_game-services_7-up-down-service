import { Core } from "sc-game-base";
import { startTrace } from "sc-instrument";
import appConfigs from "./app-configs";
import ContainerRegistry from "./container-registry";
import gameSettings from "./game-settings";
import { generateRawResultForHash, generateResult, getSettlementResult } from "./helpers";

startTrace(appConfigs.otel?.enabled, appConfigs.otel?.endpoint, appConfigs.otel?.system, appConfigs.sentry.env, gameSettings.name);

const run = async () => {
    const definition = new Core.GameDefinition(
        gameSettings,
        generateResult,
        getSettlementResult,
        generateRawResultForHash
    );
    const gameData = new Core.GameData(gameSettings.durations.wholeRound);

    const container = new ContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp("7Up7Down", appConfigs);
    await app.run();
    await app.startGame(container);
};

run();
