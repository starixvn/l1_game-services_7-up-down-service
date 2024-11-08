import { Core } from "sc-game-base";

export default class GameStatusPublisher extends Core.BaseEventPublishers.GameStatusPublisher {
    publishEnablingGameStatus() {
        const { gameConfigs, remainingTime, roundId } = this.gameData;
        const configs = {
            odds: gameConfigs.odds,
            originalOdds: gameConfigs.originalOdds,
            enableFreeBet: gameConfigs.enableFreeBet,
            multipliers: gameConfigs.multipliers,
        };

        const realPlayers = Object.values(this.gameData.realPlayers);
        realPlayers.forEach((realPlayer) => {
            const settings = this.gameData.currencyGroupGames.find((x) => x.groupId.toString() === realPlayer.session.currencyGroupId);
            const payload = { gameConfigs: { ...configs, ...settings }, remainingTime, snr: true };
            realPlayer.socketClient && realPlayer.socketClient.emit(this.gameName, payload);
        });

        this.publishToAllAdmins({
            remainingTime,
            roundId,
            currencies: this.gameData.currencies,
            exchangeRates: this.gameData.exchangeRates,
        });
    }
}
