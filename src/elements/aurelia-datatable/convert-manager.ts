import { inject, PLATFORM, autoinject } from "aurelia-framework";
import { ViewResources } from "aurelia-templating";
import { getLogger } from "aurelia-logging";
import typer from 'typer';

@inject(ViewResources)
export class ConvertManagerValueConverter {
  viewResources: any;
  logger: any;

  constructor(viewResources: any) {
    this.viewResources = viewResources;
    this.logger = getLogger("aurelia-datatable");
  }

  runConverter(value: any, converter: string, convertParams: any, rowData: any) {
    let valueConverter = this.viewResources.getValueConverter(converter);

    if (valueConverter) {
      return valueConverter.toView(value, convertParams, rowData);
    }

    this.logger.error('No ValueConverter named "' + converter + '" was found!');

    return value;
  }

  toView(value: any, converters: any, rowData: any) {
    if (!converters) {
      return value;
    }

    if (typeof converters === "string") {
      converters = converters.split(" | ");
    }

    for (let converter of converters) {
      let index = converter.indexOf(":");

      if (index < 0) {
        value = this.runConverter(value, converter, null, rowData);

        continue;
      }

      let name = converter.slice(0, index);
      let param = this.parseParams(converter.slice(index + 1).trim());

      value = this.runConverter(value, name, param, rowData);
    }

    return value;
  }

  parseParams(str: string) {
    if (!str) {
      return null;
    }

    if (typer.detect(str) === "string" && str[0] !== "{") {
      return str.substr(1, str.length - 2);
    }

    return typer.cast(str);
  }
}
