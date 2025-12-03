import { Core } from "sc-game-base";
import { callAndForget } from "sc-game-base/src/core/game-management-api";

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

                    const endGameResult = await this.callEndGame(bet, roundId, time, betResult);

                    this.captureBetResult(bet.uid, betResult, bet.rate);

                    if (endGameResult.isOk) {
                        await this.userBetResultPublisher.publish(bet.uid, betResult);
                    }
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
        const betResult = Object.entries(settlementResult).reduce(
            (result, [choice, win]) => {
                const betAmount = bet[choice] ?? 0;
                const originalOdds = odds[choice] || 1;
                const effectiveOdds = bet.freeBet ? originalOdds - 1 : originalOdds;
                const winAmount = win ? betAmount * effectiveOdds : 0;

                result.totalBetAmount += betAmount;
                result.totalWin += winAmount;
                result.winningByChoices[choice] = winAmount;

                if (winAmount > 0) {
                    result.netWin += winAmount - betAmount;
                } else {
                    result.totalLost += betAmount;
                }

                return result;
            },
            {
                totalBetAmount: 0,
                totalWin: 0,
                netWin: 0,
                totalLost: 0,
                winningByChoices: {},
            }
        );

        betResult.totalWin = Math.min(betResult.totalWin, bet.maxWin).toFixed(4);
        betResult.netWin = +(betResult.totalWin - bet.totalAmount).toFixed(4);
        betResult.reachMaxWin = parseInt(betResult.totalWin) === bet.maxWin;

        return betResult;
    }

    async callEndGame(bet, roundId, time, betResult) {
        const { gameInfo, settlementInfo } = this.formatEndGameInfo(bet, roundId, time, betResult);

        const apiResult = await this.endGame(bet.uid, gameInfo, settlementInfo);

        if (apiResult.isOk) {
            settlementInfo.red > 0 &&
                callAndForget(this.gameManagementApiClient.users.updateBalance({ id: bet.uid, deductionAmount: -settlementInfo.red }));
        } else {
            this.userBetResultPublisher.publishApiError(bet.uid, apiResult.response);
        }

        return apiResult;
    }
}
