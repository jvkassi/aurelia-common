import {
  customAttribute,
  autoinject,
  bindingMode
}
from 'aurelia-framework';

@customAttribute('selected', bindingMode.twoWay)
@autoinject()
export class Selected {

  constructor(private element: Element) {};

  valueChanged(newValue: any) {

    if (newValue) {
      this.element.classList.add('selected');
    }
    else {
      this.element.classList.remove('selected');
    }
  }
}
