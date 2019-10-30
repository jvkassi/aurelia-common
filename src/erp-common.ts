import { inject, PLATFORM, useView, autoinject, noView } from 'aurelia-framework';
import { AureliaConfiguration } from 'aurelia-configuration';
import { Router, RouteConfig } from 'aurelia-router';
// import { EntityManager } from 'aurelia-orm';
import { AuthService } from 'aurelia-authentication';
import { UserService } from './services/user/service';

// import { Hotel } from "packages/aurelia-erp-hotel";
// require("packages/aurelia-erp-hotel");
PLATFORM.moduleName('./index');
// tslint:disable-next-line:completed-docs
@noView()
@autoinject()
export class ErpCommon {
  // private user: any;
  // public application: any;
  private config: any;
  // // auth: any;
  // router: Router;
  // auth: AuthService;
  private routes: Array<RouteConfig>  = Array<RouteConfig>();
  private application: String = '';
  private user: any;

  constructor(
    private AureliaConfiguration: AureliaConfiguration,
    // tslint:disable-next-line: no-parameter-properties
    // tslint:disable-next-line: no-parameter-properties
    private auth: AuthService,
    private router: Router,
    private UserService: UserService,
    // private EntityManager: EntityManager
  ) {
    // console.log(this.application);
    // this.auth = auth;
    this.config = this.AureliaConfiguration.get('apps').filter(
      (x: { name: String}) => x.name == this.application
    )[0];
    // console.log(this.config);
    this.user = this.UserService.getInfos();
    // console.log(this.config);
    // PLATFORM.moduleName(`applications/${this.application}/index`)
  }
  /// TODO: Remove THAT PART
  private  generateMenus() {
    // console.log(this.config.menus);
    // console.log(this.user.permission);

    this.config.menus
      //  filter user permissions
      // .filter(menu => menu.settings.permissions.includes(this.user.permission))
      .map((menu: { entity: string | number; href: string; name: string; default: boolean; title: any; settings: { name: string; }; moduleId: string; crud: boolean; }) => {
        // console.log(menu);
        // this.entityManager.registerEntity(require('./entity/' + menu.entity));
        const entity = this.config.entities[menu.entity];
        menu.href = `/#/u/${this.application}/${menu.name}`;

        if (menu.default == true) {
          menu.title = menu.title || menu.name;
          menu.settings.name = `${this.application}-${menu.name}`;

          this.routes.push({
            route: ['', menu.name],
            href: menu.href,
            // route: ["/", menu.settings.name],
            name: menu.settings.name,
            nav: true,
            title: menu.title,
            moduleId: PLATFORM.moduleName(menu.moduleId),
            // moduleId: PLATFORM.moduleName("aurelia-erp-hotel"),
            // moduleId: PLATFORM.moduleName(
            //   `apps/${this.application}/components/${menu.moduleId}`
            //   // "apps/hotel/components/dashboard/index"
            // ),
            settings: menu.settings
          });
        } else if (menu.crud == false) {
          menu.title = menu.title || menu.name;
          menu.settings.name = menu.name + '-' + this.application;

          this.routes.push({
            href: menu.href,
            route: menu.name,
            name: menu.settings.name,
            nav: true,
            title: menu.title,
            // moduleId: PLATFORM.moduleName(menu.moduleId),
            moduleId: PLATFORM.moduleName(
              `apps/${this.application}/components/${menu.moduleId}`
              // "apps/hotel/components/dashboard/index"
            ),
            settings: menu.settings
          });
        } else {
          // console.log(this.config);
          this.addCrudRoutes(menu, entity);
        }
      });
  }
  private addCrudRoutes(menu: any, entity: any) {
    // console.log(menu.entity);
    menu.href = `/#/u/${this.application}/${menu.entity}`;
    this.routes.push(
      {
        href: menu.href,
        route: menu.entity,
        name: menu.entity,
        // moduleId: PLATFORM.moduleName("../../shared/crud/list/index"),
        moduleId: PLATFORM.moduleName('shared/crud/list/index'),
        nav: menu.nav == undefined ? true : menu.nav,
        title: menu.name,
        settings: {
          entity: entity,
          resource: menu.entity,
          icon: menu.settings.icon
        }
      },
      {
        href: `${menu.href}/new`,
        route: `${menu.entity}/new`,
        name: `new-${menu.entity}`,
        // moduleId: PLATFORM.moduleName(menu.new || "shared/crud/new/index"),
        moduleId: PLATFORM.moduleName('shared/crud/new/index'),
        // nav: true,
        title: 'new',
        settings: {
          entity: entity,
          resource: menu.entity,
          icon: menu.settings.icon
        }
      },
      {
        href: `${menu.href}/:id`,
        route: `${menu.entity}'/:id`,
        name: `edit-${menu.entity}`,
        moduleId: PLATFORM.moduleName(
          menu.edit || menu.new || `shared/crud/edit/index`
        ),
        // nav: true,
        title: 'edit',
        settings: {
          entity: entity,
          icon: menu.settings.icon,
          resource: menu.entity
        }
      }
    );
  }

 private configureRouter(config: any) {
    this.generateMenus();
    // console.log(this.routes);
    config.title = this.application;
    // this.routes
    config.map(this.routes);
    // this.router = router;
  }

  // replace current view
  private determineActivationStrategy() {
    return 'replace';
  }

}
