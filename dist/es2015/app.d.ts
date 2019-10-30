import { AureliaConfiguration } from 'aurelia-configuration';
export declare class App {
    private AureliaConfiguration;
    private config;
    private routes;
    private application;
    constructor(AureliaConfiguration: AureliaConfiguration);
    determineActivationStrategy(): string;
    configureRouter(config: any): void;
    private generateMenus;
    private addCrudRoutes;
}
