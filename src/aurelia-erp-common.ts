import { PLATFORM, FrameworkConfiguration } from "aurelia-framework";

import { App } from "./app";
import { Service } from "./service";
import { User } from "./user";
import { Config as ViewManager } from "aurelia-view-manager";

export function configure(config: FrameworkConfiguration): void {
  config.container
    .get(ViewManager)
    .configureNamespace("spoonx/datatable", {
      map: {
        datatable: PLATFORM.moduleName(
          "./elements/aurelia-datatable/datatable.html"
        )
      }
    })
    .configureNamespace("aurelia-pager", {
      framework: "aurelia",
      map: {
        pager: PLATFORM.moduleName("./elements/aurelia-pager/pager.html")
      }
    })
    .configureNamespace("spoonx/form", {
      map: {
        "aurelia-form": PLATFORM.moduleName(
          "./elements/aurelia-form/aurelia-form.html"
        ),
        "entity-form": PLATFORM.moduleName(
          "./elements/aurelia-form/entity-form.html"
        ),
        "form-element": PLATFORM.moduleName(
          "./elements/aurelia-form/form-element.html"
        ),
        "form-label": PLATFORM.moduleName(
          "./elements/aurelia-form/form-label.html"
        ),
        "form-button": PLATFORM.moduleName(
          "./elements/aurelia-form/form-button.html"
        ),
        "form-help": PLATFORM.moduleName(
          "./elements/aurelia-form/form-help.html"
        ),
        "form-group": PLATFORM.moduleName(
          "./elements/aurelia-form/form-group.html"
        ),
        "form-checkbox": PLATFORM.moduleName(
          "./elements/aurelia-form/form-checkbox.html"
        ),
        "form-association": PLATFORM.moduleName(
          "./elements/aurelia-form/form-association.html"
        ),
        "form-error": PLATFORM.moduleName(
          "./elements/aurelia-form/form-error.html"
        ),
        "form-input": PLATFORM.moduleName(
          "./elements/aurelia-form/form-input.html"
        ),
        "form-radio": PLATFORM.moduleName(
          "./elements/aurelia-form/form-radio.html"
        ),
        "form-select": PLATFORM.moduleName(
          "./elements/aurelia-form/form-select.html"
        ),
        "form-textarea": PLATFORM.moduleName(
          "./elements/aurelia-form/form-textarea.html"
        )
      }
    })
    .configureNamespace("spoonx/orm", {
      framework: "bulma",
      map: {
        "association-select": PLATFORM.moduleName(
          "./elements/aurelia-orm/association-select.html"
        ),
        paged: PLATFORM.moduleName("./elements/aurelia-orm/paged.html")
      }
    });
}

export { App, Service, User };
