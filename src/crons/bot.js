import { helpers } from "sc-common";
import { Core } from "sc-game-base";
import { getOrDefault } from "sc-game-base/src/core/game-management-api";
import constants from "../constants";

export default class Bot extends Core.Crons.BaseBot {
    constructor(definition, gameData, gameManagementApiClientFactory) {
        super(definition, gameData, gameManagementApiClientFactory);

        this.betChoiceRatio = {
            mainChoices: 80,
            rareChoices: 20,
        };

        this.mainOpts = ["up", "down"];
        this.rareOpts = ["seven"];

        this.smallTicketRatio = 70;
        this.smallTickets = 0;
        this.resetAllBets();
    }

    async reset() {
        await super.reset();

        const configs = this.gameData.gameConfigs;

        if (configs?.botenabled) {
            const bots = await getOrDefault(this.gameManagementApiClient.users.getAllBots(this.maxNumberOfBots, true), this.bots);
            this.bots = this.chance.shuffle(bots);
        } else {
            this.bots = [];
        }
    }

    async placeBet(bot) {
        if (this.gameData.remainingTime > this.definition.durations.lockingBet) {
            const choice = this.getBetChoice(bot);
            const minBet = this.getMinBet();
            const maxBet = this.getMaxBet(bot, choice);
            const betAmount = this.convertAmountToChip(helpers.numberHelper.getRandomNumberStep5(minBet, maxBet, true));

            this.gameData.totalBets[choice] = (this.gameData.totalBets[choice] ?? 0) + betAmount;
            this.allBets[choice] = (this.allBets[choice] ?? 0) + betAmount;
            this.totalTickets++;

            if (this.isSmallTicket(betAmount)) {
                this.smallTickets++;
            }
        }
    }

    resetAllBotData() {
        super.resetAllBotData();
        this.resetAllBets();
    }

    resetAllBets() {
        this.allBets = {
            up: 0,
            down: 0,
            seven: 0,
        };

        this.smallTickets = 0;
    }

    getBetChoice(bot) {
        const totalBotBet = this.getAllBetAmount();

        const betChoiceRatios = [
            {
                group: this.mainOpts,
                underBetRatio: (this.getTotalAmountOnChoiceGroup(this.mainOpts) * 100) / totalBotBet < this.betChoiceRatio.mainChoices,
            },
            {
                group: this.rareOpts,
                underBetRatio: (this.getTotalAmountOnChoiceGroup(this.rareOpts) * 100) / totalBotBet < this.betChoiceRatio.rareChoices,
            },
        ];

        const underRatioGroups = helpers.arrayHelper.shuffle(betChoiceRatios.filter((data) => data.underBetRatio));

        return underRatioGroups.length > 0
            ? this.getRandomChoiceFromGroup(underRatioGroups[0].group)
            : this.getRandomChoiceFromGroup(this.mainOpts);
    }

    getMaxBet(bot, choice) {
        const gameConfigs = this.gameData.gameConfigs;
        const minBet = this.getMinBet();
        const isSmallTicket = this.totalTickets === 0 ? true : (this.smallTickets * 100) / this.totalTickets < this.smallTicketRatio;
        const maxBet = Math.min(gameConfigs.choices_maxbet[choice], gameConfigs.bot_maxbet);

        const maxBetOfSmallTicket = Math.min(minBet * 50, gameConfigs.bot_maxbet * 0.3);

        if (this.mainOpts.includes(choice)) {
            return isSmallTicket ? maxBetOfSmallTicket : maxBet;
        }

        return Math.min(minBet * 10, gameConfigs.bot_maxbet * 0.2, gameConfigs.choices_maxbet[choice]);
    }

    getRandomChoiceFromGroup(group) {
        return this.chance.pickone(group);
    }

    getTotalAmountOnChoiceGroup(choices) {
        let total = 0;
        choices.forEach((choice) => (total += this.allBets[choice]));

        return total;
    }

    getAllBetAmount() {
        let total = 0;
        this.definition.choices.forEach((choice) => (total += this.allBets[choice]));

        return total;
    }

    isSmallTicket(amount) {
        return amount <= this.getMinBet() * 50;
    }

    getTotalBetAmount(currentBet) {
        return currentBet ? this.definition.choices.reduce((total, choice) => total + currentBet[choice], 0) : 0;
    }

    convertAmountToChip(amount) {
        const chipList = constants.chips.filter((chip) => amount / chip >= 1);

        return chipList.length > 0 ? chipList[0] : this.getMinBet();
    }
}
