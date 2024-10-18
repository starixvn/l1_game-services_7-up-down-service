import { Core } from "sc-game-base";

export default class SocketRouter extends Core.Routers.BaseSocketRouter {
    handlePlaceBet(payload) {
        const realPlayer = this.gameData.realPlayers[this.socketClient.id];
        console.log(realPlayer);
        console.log(payload);
        try {
            if (!this.verify()) {
                console.log("verify failed");
                return;
            }
            console.log("verify succeed");

            this.placeBetConsumer.consume(this.gameData.realPlayers[this.socketClient.id], payload);
        } catch (error) {
            this.logService.logError(error);
        }
    }
}
