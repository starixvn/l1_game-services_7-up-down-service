import { Core } from "sc-game-base";

export default class SocketRouter extends Core.Routers.BaseSocketRouter {
    constructor({
        definition,
        gameData,
        userSignInConsumer,
        inGameConsumer,
        placeBetConsumer,
        userDisconnectConsumer,
        userSignInPublisher,
        historyQuery,
        logService,
        playGamePermissionValidator,
        roundQuery,
        gameResultServiceConsumer,
    }) {
        super({
            definition,
            gameData,
            userSignInConsumer,
            inGameConsumer,
            placeBetConsumer,
            userDisconnectConsumer,
            userSignInPublisher,
            historyQuery,
            logService,
            playGamePermissionValidator,
            roundQuery,
        });

        this.gameResultServiceConsumer = gameResultServiceConsumer;
    }

    init(socketClient) {
        super.init(socketClient);
        this.socketClient.on("betDetails", this.handleBetDetails.bind(this));
    }

    async handleBetDetails(payload) {
        try {
            if (!this.verify()) {
                return;
            }

            const { playerId, operatorId, siteId } = this.gameData.realPlayers[this.socketClient.id].session;
            const { mode, timeZoneOffset, roundId, language } = payload;

            const result = await this.gameResultServiceConsumer.getUrl({
                playerId,
                operatorId,
                siteId,
                roundId,
                mode,
                timeZoneOffset,
                language,
            });

            if (result.isAuthenticated) {
                this.socketClient.emit(this.definition.name, { betDetailsUrl: result.redirectUrl });
            }
        } catch (error) {
            this.logService.logError(error);
        }
    }
}
