import { AureliaConfiguration } from 'aurelia-configuration';
import { Router } from 'aurelia-router';
import { AuthService } from 'aurelia-authentication';
import { UserService } from './services/user/service';
export declare class ErpCommon {
    private AureliaConfiguration;
    private auth;
    private router;
    private UserService;
    private config;
    private routes;
    private application;
    private user;
    constructor(AureliaConfiguration: AureliaConfiguration, auth: AuthService, router: Router, UserService: UserService);
    private generateMenus;
    private addCrudRoutes;
    private configureRouter;
    private determineActivationStrategy;
}
