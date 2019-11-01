export declare class Dialog {
    private dialog;
    confirm(title?: string, text?: string): Promise<any>;
    prompt(label: string, title?: string, type?: string, text?: string): Promise<any>;
}
