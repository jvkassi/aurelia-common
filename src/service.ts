import { EntityManager } from "aurelia-orm";
import { autoinject } from "aurelia-framework";

@autoinject
export class Service {
  protected entity: string = "";

  constructor(protected EntityManager: EntityManager) {}

  public find(filters: number | Object | undefined): any {
    return this.EntityManager.getRepository(this.entity).find(filters);
  }

}
