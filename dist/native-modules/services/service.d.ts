import { EntityManager } from "aurelia-orm";
export declare class AppService {
    protected EntityManager: EntityManager;
    protected entity: string;
    constructor(EntityManager: EntityManager);
    get(id?: undefined): any;
    getAll(filters?: {}): any;
}
