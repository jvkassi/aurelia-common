import { AuthService } from "aurelia-authentication";
export declare function login(state: any, creds: {
    username: string;
    password: string;
}, auth: AuthService): Promise<any>;
