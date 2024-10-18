import crypto from "crypto";

const randomString = (length = 21) => {
    return crypto.randomBytes(length).toString("hex").slice(0, length);
};

const createSHA256Hash = (value) => {
    return crypto.createHash("sha256").update(value).digest("hex");
};

export const generateSHA256Result = (formattedResult, roundId) => {
    const formattedResultWithSalt = `${formattedResult}_{#${roundId}${randomString()}}`;
    return { hashValue: createSHA256Hash(formattedResultWithSalt), rawValue: formattedResultWithSalt };
};
