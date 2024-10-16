import { Core } from "sc-game-base";
import { startTrace } from "sc-instrument";
import appConfigs from "./app-configs";
import BaccaratContainerRegistry from "./baccarat-container-registry";
import gameSettings from "./game-settings";
import { resultHelper } from "./helpers";

startTrace(appConfigs.otel?.enabled, appConfigs.otel?.endpoint, appConfigs.otel?.system, appConfigs.sentry.env, gameSettings.name);

const run = async () => {
    const definition = new Core.GameDefinition(
        gameSettings,
        resultHelper.generateResult,
        resultHelper.getSettlementResult,
        resultHelper.generateRawResultForHash
    );
    const gameData = new Core.GameData(gameSettings.durations.wholeRound);

    const container = new BaccaratContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp("7UpDown", appConfigs);
    await app.run();
    await app.startGame(container);
};

run();
