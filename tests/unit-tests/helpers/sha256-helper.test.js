import { generateSHA256Result } from "../../../src/helpers";

describe("generateSHA256Result", () => {
    it("should return sha256 hash and raw string", () => {
        //Act
        const sha256Result = generateSHA256Result("{1,2}{2x:2-6}", 100);

        //Assert
        expect(sha256Result.hashValue).not.toBeUndefined();
    });
});
