import { Core } from "sc-game-base";

export default class InGameConsumer extends Core.BaseEventConsumers.InGameConsumer {
    async buildPayload(realPlayer) {
        const payload = await super.buildPayload(realPlayer);
        const multipliers = this.gameData.gameConfigs.oddsMultipliers.values
            .filter((x) => x.ratio > 0 && x.number > 1)
            .map((x) => x.number);

        payload.gameConfigs.multiplierRange = {
            min: Math.min(...multipliers),
            max: Math.max(...multipliers),
        };

        return payload;
    }
}
