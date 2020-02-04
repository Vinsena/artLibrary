import { google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';

export class GoogleService {
    
    private _googleConfig = require('../google-config.json');

    /**
     * Create the google url to be sent to the client.
     */
    getGoogleUrl(): string {
        const auth = this.createConnection(); // this is from previous step
        const url = this.getConnectionUrl(auth);
        return url;
    }

    /**
     * Extract the email and id of the google account from the "code" parameter.
     */
    public async getGoogleAccountFromCode(code: string): Promise<any> {
  
        const oauth2Client = this.createConnection() as OAuth2Client;
        // get the auth "tokens" from the request
        const {tokens} = await oauth2Client.getToken(code);
    
        // add the tokens to the google api so we have access to the account
        oauth2Client.setCredentials(tokens);

        const oath2 = google.oauth2({ version: 'v1', auth: oauth2Client });

        const {data} = await oath2.userinfo.v2.me.get({auth: oauth2Client});
        return {
            email: data.email,
            hd: data.hd,
            picture: data.picture,
            token: tokens.access_token
        };
    }

    private createConnection(): OAuth2Client {
        return new google.auth.OAuth2(
            this._googleConfig.clientId,
            this._googleConfig.clientSecret,
            this._googleConfig.redirect
        );
    }
  
    private getConnectionUrl(auth: OAuth2Client): string {
      return auth.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', // access type and approval prompt will force a new refresh token to be made each time signs in
        scope: this._googleConfig.defaultScope
      });
    }
}
