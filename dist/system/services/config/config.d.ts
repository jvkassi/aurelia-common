import { AureliaConfiguration } from "aurelia-configuration";
import { EntityManager } from "aurelia-orm";
export declare class Config {
    config: AureliaConfiguration;
    settings: any;
    general: any;
    entityManager: EntityManager;
    constructor(EntityManager: any, AureliaConfiguration: any);
    get(): any;
    set(settings: any): any;
}
