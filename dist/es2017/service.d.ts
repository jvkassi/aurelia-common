import { EntityManager } from "aurelia-orm";
export declare class Service {
    protected EntityManager: EntityManager;
    protected entity: string;
    constructor(EntityManager: EntityManager);
    find(filters: number | Object | undefined): any;
}
