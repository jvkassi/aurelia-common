import { AureliaConfiguration } from 'aurelia-configuration';
export declare class App {
    private AureliaConfiguration;
    protected application: String;
    private config;
    private routes;
    constructor(AureliaConfiguration: AureliaConfiguration);
    determineActivationStrategy(): string;
    configureRouter(config: any): void;
    private generateMenus;
    private addCrudRoutes;
}
