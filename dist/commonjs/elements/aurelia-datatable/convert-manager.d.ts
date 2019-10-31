export declare class ConvertManagerValueConverter {
    viewResources: any;
    logger: any;
    constructor(viewResources: any);
    runConverter(value: any, converter: string, convertParams: any, rowData: any): any;
    toView(value: any, converters: any, rowData: any): any;
    parseParams(str: string): any;
}
