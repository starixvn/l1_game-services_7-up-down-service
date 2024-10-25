import { Core } from "sc-game-base";
import { initAPIStub, stubUserService, subGameManagementService } from "sc-game-service-integration-utils";
import appConfigs from "../../../src/app-configs.IGT";
import ContainerRegistry from "../../../src/container-registry";
import gameSettings from "../../../src/game-settings";
import { generateResult, getSettlementResult } from "../../../src/helpers/result-helper";

export const run = async () => {
    const definition = new Core.GameDefinition(gameSettings, generateResult, getSettlementResult);
    const gameData = new Core.GameData(gameSettings.durations.wholeRound);
    
    initAPIStub(appConfigs.apiSettings.apiUrl);
    stubUserService(appConfigs);
    subGameManagementService(appConfigs, definition);

    const container = new ContainerRegistry().register(appConfigs, definition, gameData);
    const app = new Core.BaseGameApp(gameSettings.name, appConfigs);
    await app.run();
    await app.startGame(container);
};

run();
