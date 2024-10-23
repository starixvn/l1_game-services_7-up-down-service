import { Core } from "sc-game-base";

export default class SettleGameRoundConsumer extends Core.BaseEventConsumers.SettleGameRoundConsumer {
    async settleBets({ settlementResult, roundId, time }) {
        const bets = await this.queryBets(roundId);

        if (bets && bets.length) {
            const odds = this.calculateFinalOdds();

            await Promise.all(
                bets.map(async (bet) => {
                    const betResult = this.calculateBetResult(settlementResult, bet, odds);

                    bet.betwin = betResult.totalWin;
                    bet.paid = true;
                    bet.reachMaxWin = betResult.reachMaxWin;

                    await bet.save();
                    await this.callEndGame(bet, roundId, time, betResult);

                    this.captureBetResult(bet.uid, betResult, bet.rate);
                    await this.userBetResultPublisher.publish(bet.uid, betResult);
                })
            );
        }
    }

    calculateFinalOdds() {
        const { odds } = this.gameData.gameConfigs;
        const finalOdds = { ...odds };
        const { multiplier } = this.gameData.result;
        if (multiplier) {
            const { choice, value } = multiplier;
            finalOdds[choice] = (finalOdds[choice] - 1) * value + 1;
        }

        return finalOdds;
    }

    calculateBetResult(settlementResult, bet, odds) {
        const betResult = super.calculateBetResult(settlementResult, bet, odds);

        betResult.totalWin = Math.min(betResult.totalWin, bet.maxWin);
        betResult.netWin = +(betResult.totalWin - bet.totalAmount).toFixed(2);
        betResult.reachMaxWin = betResult.totalWin === bet.maxWin;

        return betResult;
    }

    collectRoundResult(result, settlementResult, roundId) {
        return {
            result,
            settlementResult,
            roundId,
        };
    }
}
