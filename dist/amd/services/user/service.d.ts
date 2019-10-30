import { AuthService } from 'aurelia-authentication';
export declare class UserService {
    private AuthService;
    user: any;
    constructor(AuthService: AuthService);
    getInfos(): any;
    logout(): void;
}
