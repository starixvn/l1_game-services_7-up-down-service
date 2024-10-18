import { Core } from "sc-game-base";
import { generateSHA256Result } from "../helpers";

export default class RoundResultConsumer extends Core.BaseEventConsumers.RoundResultConsumer {
    generateResult() {
        const resultFromAdmin = this.gameData.settlementResultFromAdmin;
        const { randomMode, oddsMultipliers } = this.gameData.gameConfigs;

        const result =
            this.gameData.roundId === resultFromAdmin.roundId
                ? resultFromAdmin.result
                : this.definition.generateResult(randomMode, oddsMultipliers);

        return result;
    }

    buildResultHash() {
        const formattedResult = this.definition.generateRawResultForHash(this.gameData.result);
        return { ...generateSHA256Result(formattedResult, this.gameData.roundId), roundId: this.gameData.roundId };
    }
}
