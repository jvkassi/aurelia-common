import { DialogController } from "aurelia-dialog";
export declare class Confirm {
    private controller;
    private confirm;
    constructor(controller: DialogController);
    activate(params: {
        title: string;
        text: string;
    }): void;
}
