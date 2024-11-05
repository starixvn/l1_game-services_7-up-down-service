import { Core } from "sc-game-base";

export default class GameCron extends Core.Crons.BaseGameCron {
    isStartingTime(remainingTime, durations) {
        return remainingTime === durations.placingBets + durations.shakeThePlateDuration;
    }
}
