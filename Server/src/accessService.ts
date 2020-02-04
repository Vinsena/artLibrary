import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import {Request, Response} from 'express';
import {GoogleService} from './googleService';
import * as jwtExpress from 'express-jwt';
import {NextFunction} from 'connect';
import {AccessType} from './model/accessType';
import {User} from './model/user';


export class AccessService {

    private _users: {[email: string]: User} = {};
    private _googleService: GoogleService;

    constructor(private _app: express.Express, private _enableGoogleAuth: boolean) {
        if (_enableGoogleAuth) {
            this._googleService = new GoogleService();
            this.processGoogleAuth();
        }

        this.loadPermissions();
    }

    public getAuthConfig() {
        return {
            enableGoogleAuth : this._enableGoogleAuth,
            googleAuthUrl: this._enableGoogleAuth ? this._googleService.getGoogleUrl() : ''
        };
    }

    public getUserList() {
        return this._users;
    }

    private processGoogleAuth() {

        this._app.post('/google-auth', async(req: Request, res: Response) => {

            const code = req.body['code'];
            if (!code) {
                res.status(401).send('Invalid code');
            }

            const account: {hd: string, email: string} = await this._googleService.getGoogleAccountFromCode(code)
                .catch((error) => {
                    console.log(error);
                    res.status(401).send(error);
                });

            console.log(account);

            const userPermissions = this.getUserPermissions(account.email);
            if (!userPermissions) {
                this.grantPermissions(account.email, AccessType.VIEW);
            }

            const hasPermissions = this.hasPermission(account.email, AccessType.VIEW);

            const token = jwt.sign({
                sub: account.email,
                rights: ["VIEW", "UPLOAD", "DELETE", "INSTANT_DELETE", "CHANGE_RIGHTS", "VIEW_USERS"] // TODO: Get real permissions
            }, 'shhhhhhared-secret');

            res.status(hasPermissions ? 200 : 403).send(hasPermissions ? {token} : { error: 'access denied' });
        });
    }

    public authorize(roles: any[] = []) {
        // roles param can be a single role string (e.g. Role.User or 'User')
        // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
        if (typeof roles === 'string') {
            roles = [roles];
        }

        return [
            // authenticate JWT token and attach user to request object (req.user)
            jwtExpress({ secret: 'shhhhhhared-secret' }),

            // authorize based on user role
            (req: any, res: Response, next: NextFunction) => {
                if (roles.length && !roles.includes(req.user.role)) {
                    // user's role is not authorized
                    return res.status(401).json({ message: 'Unauthorized' });
                }

                // authentication and authorization successful
                next();
            }
        ];
    }

    private getUserPermissions(email: string): AccessType[] {
        return this._users[email].rights;
    }

    private grantPermissions(email: string, permissions: AccessType | AccessType[]) {
        let userPermissions = this.getUserPermissions(email);
        if (!userPermissions) {
            userPermissions = [];
            if (!this._users[email]) {
                this._users[email] = new User();
            }
            this._users[email].rights = userPermissions;
        }
        if (Array.isArray(permissions)) {
            permissions.forEach(p => this.grantPermission(p, userPermissions));
        } else {
            this.grantPermission(permissions, userPermissions);
        }
        // TODO: Save permissions into json file
    }

    private grantPermission(permission: AccessType, list: AccessType[]) {
        if (!list.includes(permission)) {
            list.push(permission);
        }
    }

    private hasPermission(email: string, permission: AccessType) {
        const userPermissions = this.getUserPermissions(email);
        if (!userPermissions) {
            return false;
        }

        return userPermissions.includes(permission);
    }

    private loadPermissions() {
        // TODO: Load permissions from json files
    }
}
