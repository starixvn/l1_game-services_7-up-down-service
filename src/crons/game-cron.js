import { Core } from "sc-game-base";

export default class GameCron extends Core.Crons.BaseGameCron {
    isStartingTime(remainingTime, durations) {
        return remainingTime === durations.placingBets + durations.shakeThePlateDuration;
    }
    async proceed() {
        await super.proceed();
        const { durations } = this.definition;

        if (this.gameData.remainingTime === durations.lockingBet - 1) {
            this.publishMultiplierResult();
        }
    }

    publishMultiplierResult() {
        const { multiplier } = this.gameData.result;
        multiplier && this.runningRoundInfoPublisher.publishToAllUsers({ multiplier });
    }
}
