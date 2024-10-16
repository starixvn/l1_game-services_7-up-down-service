import { utils } from "sc-common";
import { Core } from "sc-game-base";

export default class HttpRouter extends Core.Routers.HttpRouter {
    init(app) {
        super.init(app);

        app.post(
            "/api/set-result",
            utils.authentication.useAuthenticate({
                authUrl: this.appConfigs.apiSettings.authUrl,
                audiences: this.appConfigs.authenticateSettings.audiences,
            }),
            (_req, res) => this.handleSetResult(_req.body, res)
        );
    }

    handleSetResult(params, res) {
        try {
            if (!params || !params.result) {
                this.logService.logError("receives a result cheating call with invalid params.");
                res.send(false);

                return;
            }
            const roundId = params.roundId ?? this.gameData.roundId;
            this.logService.logWarning(`receives a result cheating call with the result as ${JSON.stringify(params.result)}.`);

            this.gameData.settlementResultFromAdmin = { result: params.result, roundId };

            res.send({ isSuccessful: true, roundId });
        } catch (error) {
            this.logService.logError(error);
            res.send({ isSuccessful: false });
        }
    }
}
