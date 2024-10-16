import { Core } from "sc-game-base";

export default class SettleGameRoundConsumer extends Core.BaseEventConsumers.SettleGameRoundConsumer {
    collectRoundResult(result, settlementResult, roundId) {
        const { dice1, dice2 } = result;
        
        return {
            result: { dice1, dice2 },
            settlementResult,
            roundId,
        };
    }
}
