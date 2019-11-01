import { Prompt } from './services/prompt';
import { Confirm } from './services/confirm';
import { FrameworkConfiguration } from "aurelia-framework";
import { PLATFORM } from "aurelia-pal";

export function configure(config: FrameworkConfiguration): void {
  config.globalResources([
    PLATFORM.moduleName("./binding-behaviors/selected"),
    PLATFORM.moduleName("./value-converters/bytes"),
    PLATFORM.moduleName("./value-converters/filter"),
    PLATFORM.moduleName("./value-converters/limit"),
    PLATFORM.moduleName("./value-converters/second"),
    PLATFORM.moduleName("./value-converters/range"),
    PLATFORM.moduleName("./value-converters/datetime"),
    PLATFORM.moduleName("./value-converters/capitalize"),
    PLATFORM.moduleName("./value-converters/orderby"),
    PLATFORM.moduleName("./value-converters/basename"),
    PLATFORM.moduleName("./value-converters/keys"),
    PLATFORM.moduleName("./value-converters/find"),
    PLATFORM.moduleName("./value-converters/lowercase"),
    PLATFORM.moduleName("./value-converters/uppercase")
  ]);
}

