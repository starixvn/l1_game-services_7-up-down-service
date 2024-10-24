import { Core } from "sc-game-base";

export default class InGameConsumer extends Core.BaseEventConsumers.InGameConsumer {
    async buildPayload(realPlayer) {
        const payload = await super.buildPayload(realPlayer);

        if (this.gameData.gameConfigs?.oddsMultipliers) {
            const multipliers = this.gameData.gameConfigs.oddsMultipliers.values
                .filter((x) => x.ratio > 0 && x.number > 1)
                .map((x) => x.number);

            payload.gameConfigs.multiplierRange = {
                min: Math.min(...multipliers),
                max: Math.max(...multipliers),
            };
        }

        if (this.gameData.remainingTime <= this.definition.durations.lockingBet - 1) {
            payload.multiplier = this.gameData.result.multiplier;
        }

        return payload;
    }
}
