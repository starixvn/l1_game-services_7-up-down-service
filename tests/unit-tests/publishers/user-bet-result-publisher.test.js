import UserBetResultPublisher from "../../../src/publishers/user-bet-result-publisher";

describe("UserBetResultPublisher", () => {
    let publisher;
    let mockPublishToUser;

    beforeEach(() => {
        mockPublishToUser = jest.fn();
        publisher = new UserBetResultPublisher();
        publisher.publishToUser = mockPublishToUser;
    });

    describe("publish", () => {
        const userId = "test-user-id";

        it("should publish winning bet result correctly", async () => {
            const betResult = {
                winningByChoices: { up: 100 },
                totalWin: 500,
                reachMaxWin: true,
            };

            await publisher.publish(userId, betResult);

            expect(mockPublishToUser).toHaveBeenCalledWith(userId, {
                status: {
                    winningByChoices: { up: 100 },
                    win: true,
                    bet: 500,
                    reachMaxWin: true,
                },
            });
        });

        it("should publish losing bet result correctly", async () => {
            const betResult = {
                winningByChoices: {},
                totalWin: 0,
                totalLost: 100,
            };

            await publisher.publish(userId, betResult);

            expect(mockPublishToUser).toHaveBeenCalledWith(userId, {
                status: {
                    winningByChoices: {},
                    win: false,
                    bet: 100,
                },
            });
        });
    });
});
