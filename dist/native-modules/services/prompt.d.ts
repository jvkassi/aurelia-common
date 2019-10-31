import { DialogController } from 'aurelia-dialog';
export declare class Prompt {
    private controller;
    private config;
    constructor(controller: DialogController);
    activate(params: {
        title: string;
        label: string;
        type: string;
        value: any;
    }): void;
}
