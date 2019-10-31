import { EntityManager } from "aurelia-orm";
export declare class Service {
    protected EntityManager: EntityManager;
    protected entity: string;
    constructor(EntityManager: EntityManager);
    get(id?: undefined): any;
    getAll(filters?: {}): any;
}
