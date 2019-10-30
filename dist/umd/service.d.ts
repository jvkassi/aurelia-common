import { EntityManager } from "aurelia-orm";
export declare class Service {
    protected EntityManager: EntityManager;
    protected entity: string;
    constructor(EntityManager: EntityManager);
    protected get(id?: undefined): any;
    protected getAll(filters?: {}): any;
}
