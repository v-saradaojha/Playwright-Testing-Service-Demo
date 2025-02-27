import { test as setup } from "@playwright/test";
import * as msal from '@azure/msal-node';

import { AzureCliCredential } from "@azure/identity";

const scopes = ['https://management.core.windows.net/.default'];
setup("Getting EntraId access token", async () => {
    const testEnvironment = 'NIGHTLY';
    if (testEnvironment === "NIGHTLY") {
        await getSPNEntraToken();
    }
    else {
        await getMIEntraToken();
    }
});

export const getMIEntraToken = async () => {
    try {
        console.log("Getting MI EntraId token");
        const credential = new AzureCliCredential();
        const accessToken = await credential.getToken(scopes);
        process.env.ENTRAID_TOKEN = accessToken?.token;
        console.log("MI EntraId token acquired");
    } catch (error) {
        console.error("Failed to acquire token:", error);
    }
};
export const getSPNEntraToken = async () => {
    console.log("Getting SPN EntraId token");
    const clientId = process.env.SPN_CLIENTID!;
    const clientSecret = process.env.SPN_CLIENTSECRET!;
    const authority = process.env.AAD_AUTHORITY!;

    const msalConfig = {
        auth: {
            clientId,
            authority,
            clientSecret,
        }
    };
    const cca = new msal.ConfidentialClientApplication(msalConfig);
    const tokenRequest = {
        scopes
    };

    const tokenResponse = await cca.acquireTokenByClientCredential(tokenRequest);
    process.env.ENTRAID_TOKEN = tokenResponse?.accessToken;
};