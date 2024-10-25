import appConfigs from "./app-configs";

export default Object.assign(appConfigs, {
    hostingPort: 5002,
    apiSettings: {
        enabledApi: true,
        apiUrl: "https://api.lumigame.com",
        authUrl: "https://auth.lumigame.com",
        client: {
            id: "game-server",
            secret: "gameserver@20luminet&",
        },
        useAuthenticate: true,
        requestTimeout: 10000,
        placeBetTimeout: 2000,

        enableApiLogs: true,
    },
    authenticateSettings: {
        url: "https://auth.lumigame.com",
        id: "game-services",
        secret: "gameservices@20luminet&",
        requestTimeout: 3000,
        useAuthenticate: false,
        audiences: ["api", "admin-api"],
    },
    database: {
        url: "mongodb://127.0.0.1:27017",
        options: {
            dbName: "game-service-test-db",
        },
    },
    gameManagementApiSettings: {
        BASE: "https://l1-proxy.lumigame.com/game-management-service",
    },
});
