import { Prompt } from "./prompt";
import { Confirm } from "./confirm";
import { DialogService } from "aurelia-dialog";
import { autoinject } from "aurelia-framework";

@autoinject()
export class Dialog {
 
  constructor(private DialogService: DialogService) {};

  public async confirm(
    title: string = "",
    text: string = "Vous devez confirmer cette action"
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.DialogService
        .open({
          viewModel: Confirm,
          model: {
            title: title,
            text: text
          }
        })
        .whenClosed(response => {
          // console.log(response)
          if (response.wasCancelled) {
            reject("cancelled");
          }
          resolve(response);
        });
    });
  }

  public async prompt(
    label: string,
    title: string = "Prompt",
    type: string = "text",
    text: string = "Vous devez remplir cette information"
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.DialogService
        .open({
          viewModel: Prompt,
          model: {
            type: type,
            title: title,
            lable: label,
            text: text
          }
        })
        .whenClosed(response => {
          // console.log(response)
          if (response.wasCancelled) {
            reject("cancelled");
          }

          resolve(response);
        });
    });
  }
}
