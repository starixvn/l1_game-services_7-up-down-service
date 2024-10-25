import { GameClientDriver, normalUser } from "sc-game-service-integration-utils";
import gameSettings from "../../src/game-settings";
import { initUserSession } from "./init-user-session";
import { socketOptions } from "./stubs/test-data";

export const placeBetTest = () => {
    describe("when user place bet", () => {
        const getTimeOutToBet = (remainingTime, durations) => {
            let timeout = 0;
            if (remainingTime <= durations.lockingBet) {
                timeout = durations.wholeRound - durations.placingBets + remainingTime + 2;
            } else if (remainingTime >= durations.placingBets) {
                timeout = remainingTime - durations.placingBets + 2;
            }

            return timeout;
        };

        it("should return bet result", async () => {
            // Arrange
            const client = new GameClientDriver(socketOptions, initUserSession(normalUser));
            await client.handleSignedInEvent();
            await client.sendInGameEvent();

            // Act
            const { remainingTime } = await client.handleGameEvent((data) => data.remainingTime);

            await new Promise((resolve) => {
                setTimeout(() => {
                    client.emit("bet", { betChoice: "up", amount: 100 });
                    resolve();
                }, getTimeOutToBet(remainingTime, gameSettings.durations) * 1000);
            });

            // Assert
            const betResult = await client.handleGameEvent((data) => data.endBet);
            expect(betResult.endBet).toEqual(100);
        });
    });
};
