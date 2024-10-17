import { Core } from "sc-game-base";

export default class RoundResultConsumer extends Core.BaseEventConsumers.RoundResultConsumer {
    generateResult() {
        const resultFromAdmin = this.gameData.settlementResultFromAdmin;
        const { randomMode, oddsMultipliers } = this.gameData.gameConfigs;

        const result =
            this.gameData.roundId === resultFromAdmin.roundId
                ? resultFromAdmin.result
                : this.definition.generateResult(randomMode, oddsMultipliers);

        console.log(result);
        return result;
    }
}
