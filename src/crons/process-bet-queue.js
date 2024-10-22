import { Core } from "sc-game-base";

export default class ProcessBetQueue extends Core.Crons.ProcessBetQueue {
    async upsertBet(player, roundId, bet, rate) {
        const configs = this.gameData.gameConfigs;
        const newBet = {
            uid: player.UID,
            name: player.profile.name,
            time: new Date(),
            odds: configs.odds,
            freeBet: bet.freeBet,
            roundId,
            maxWin: this.getMaxWinPerRound(player),
        };
        const existingBetFilter = { uid: player.UID, roundId, freeBet: bet.freeBet };
        const existingBetIncrement = {
            [bet.betChoice]: bet.amount,
            totalAmount: bet.amount,
        };

        if (player.session) {
            newBet.siteId = player.session.siteId;
            newBet.currency = player.session.currencyName;
            newBet.rate = rate;

            newBet.operatorId = player.session.operatorId;
            newBet.playerId = player.session.playerId;
        }

        await this.betsRepository.updateOne(
            existingBetFilter,
            { $inc: existingBetIncrement, $setOnInsert: newBet },
            { upsert: true, setDefaultsOnInsert: true }
        );
    }

    getMaxWinPerRound(player) {
        const { maxWinPerRound } = this.gameData.gameConfigs;
        const settings = this.gameData.currencyGroupGames.find((x) => x.groupId.toString() === player.session.currencyGroupId);
        const maxBet = Math.min(player.profile.maxBet, settings.maxBet);

        return maxWinPerRound * maxBet;
    }
}
