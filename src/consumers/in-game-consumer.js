import { Core } from "sc-game-base";

export default class InGameConsumer extends Core.BaseEventConsumers.InGameConsumer {
    async consume(realPlayer) {
        const { remainingTime, gameConfigs } = this.gameData;
        const disabled = !gameConfigs || !gameConfigs.enabled || this.gameData.delayStartTime > 0;

        disabled && realPlayer.socketClient.emit(this.definition.name, { remainingTime, um: disabled, um_message: this.gameData.umMessages });

        const payload = await this.buildPayload(realPlayer);

        this.publisher.publishToUser(realPlayer.UID, payload);
    }

    async buildPayload(realPlayer) {
        const payload = await super.buildPayload(realPlayer);
        const { remainingTime } = this.gameData;
        payload.gameConfigs.maxWinPerRound = this.gameData.gameConfigs.maxWinPerRound;

        if (this.gameData.gameConfigs?.oddsMultipliers) {
            const multipliers = this.gameData.gameConfigs.oddsMultipliers.values
                .filter((x) => x.ratio > 0 && x.number > 1)
                .map((x) => x.number);

            payload.gameConfigs.multipliers = multipliers;
        }

        if (this.gameData.remainingTime <= this.definition.durations.lockingBet - 1) {
            payload.multiplier = this.gameData.result.multiplier;
        }
        return { ...payload, remainingTime };
    }

    getResultHash() {
        return this.gameData.roundId > this.gameData.resultHash.roundId
            ? {
                  rawValue: this.gameData.resultHash.rawValue,
                  extraInfos: this.gameData.result,
                  ...(!this.gameData.disabled && { hashValue: this.gameData.resultHash.hashValue }),
              }
            : { hashValue: this.gameData.resultHash.hashValue };
    }
}
