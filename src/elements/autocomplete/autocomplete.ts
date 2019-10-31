import "./autocomplete.css";

import { computedFrom, inject, bindable, bindingMode } from "aurelia-framework";

import { Config } from "aurelia-api";
import { DOM } from "aurelia-pal";
import { resolvedView } from "aurelia-view-manager";
const logger = console;

@inject(Config, DOM.Element)
export class AutoCompleteCustomElement {
  application: string;
  apiEndpoint: any;
  element: any;

  lastFindPromise: boolean = false;

  // the query string is set after selecting an option. To avoid this
  // triggering a new query we set the justSelected to true. When true it will
  // avoid performing a query until it is toggled of.
  justSelected = false;

  // Holds the value last used to perform a search
  previousValue: any = null;

  // Simple property that maintains if this is the initial (first) request.
  initial = true;

  hasFocus = false;

  //
  offline = false;

  @bindable
  showEdit = false;
  @bindable
  showNew = false;
  @bindable
  alwaysQuery = false;

  // How many characters are required to type before starting a search.
  @bindable
  minInput = 0;

  // the name of the input element
  @bindable
  name = "";

  // The max amount of results to return. (optional)
  @bindable
  limit = 5;

  // Debounce value
  @bindable
  debounce = 100;

  // initial value
  @bindable
  initValue = "";

  // The string that is appended to the api endpoint. e.g. api.com/language. language is the resource.
  @bindable
  resource: any;

  // Used when one already has a list of items to filter on. Requests is not necessary
  @bindable
  items: any;

  // The string to be used to do a contains search with. By default it will look if the name contains this value.
  @bindable({
    defaultBindingMode: bindingMode.twoWay
  })
  value = "";

  // Can be used to select default element visually
  @bindable
  selected: any;

  // The property to query on.
  @bindable
  attribute = "name";

  // Used to pass the result of the selected value to the user's view model
  @bindable({
    defaultBindingMode: bindingMode.twoWay
  })
  result: any = null;

  // The results returned from the endpoint. These can be observed and mutated.
  @bindable({
    defaultBindingMode: bindingMode.twoWay
  })
  results: any = [];

  // Which relations to populate for results
  @bindable
  populate = "";

  // The label to show in the footer. Gets pulled through aurelia-i18n.
  @bindable
  footerLabel = "Create";

  // Callback to call when the footer gets clicked.
  @bindable
  footerSelected: any;

  // Never, always or no-results
  @bindable
  footerVisibility = "never";

  // Used to determine the string to be shown as option label
  @bindable
  label = (result:  any ): any => {
    return typeof result === "object" && result !== null
      ? result[this.attribute]
      : result;
  };

  // Allow to overwrite the default apiEndpoint
  @bindable
  endpoint: any;

  // Input field's placeholder
  @bindable
  placeholder = "Search";

  // Sort method that takes a list and returns a sorted list. No sorting by default.
  @bindable
  sort = (items: any) => items;

  // Used to make the criteria more specific
  @bindable
  criteria = {};

  @computedFrom("results", "value")
  get showFooter() {
    let visibility = this.footerVisibility;

    return (
      visibility === "always" ||
      (visibility === "no-results" &&
        this.value &&
        this.value.length &&
        (!this.results || !this.results.length))
    );
  }

  /**
   * Autocomplete constructor.
   *
   * @param {Config}  api
   * @param {Element} element
   */
  constructor(api: any, element: any) {
    this.element = element;
    this.apiEndpoint = api;
    this.application = location.hash.split("/")[2];
  }

  /**
   * Bind callback.
   *
   * @returns {void}
   */
  bind() {
    if (!this.resource && !this.items) {
      return logger.error(
        "auto complete requires resource or items bindable to be defined"
      );
    }

    this.value = this.label(this.result);
    this.apiEndpoint = this.apiEndpoint.getEndpoint(this.endpoint);
  }

  /**
   * Set focus on dropdown.
   *
   * @param {boolean} value
   * @param {Event}   [event]
   *
   * @returns {boolean}
   */
  setFocus(value: boolean, event: any = null) {
    function isDescendant(parent: any, child: { parentNode: any; }) {
      let node = child.parentNode;

      while (node !== null) {
        if (node === parent) {
          return true;
        }

        node = node.parentNode;
      }

      return false;
    }

    // console.log(event);
    // If descendant, don't toggle dropdown so that other listeners will be called.
    if (
      event &&
      event.relatedTarget &&
      isDescendant(this.element, event.relatedTarget)
    ) {
      return true;
    }

    if (!this.hasEnoughCharacters()) {
      this.hasFocus = false;
      return true;
    }

    if (value) {
      this.valueChanged();
    }

    this.hasFocus = value;
    return false
  }

  /**
   * returns HTML that wraps matching substrings with strong tags.
   * If not a "stringable" it returns an empty string.
   *
   * @param {Object} result
   *
   * @returns {String}
   */
  labelWithMatches(result: any) {
    let label = this.label(result);

    if (typeof label !== "string") {
      return "";
    }

    return label.replace(this.regex, match => {
      return `<strong>${match}</strong>`;
    });
  }

  /**
   * Handle keyUp events from value.
   *
   * @param {Event} event
   *
   * @returns {*}
   */
  handleKeyUp(event: { keyCode: number; stopPropagation: () => void; }) {
    if (event.keyCode !== 27) {
      return;
    }

    if (this.hasFocus) {
      event.stopPropagation();
    }

    this.setFocus(false);

    return true;
  }

  /**
   * Handle keyDown events from value.
   *
   * @param {Event} event
   *
   * @returns {*}
   */
  handleKeyDown(event: { keyCode: number; preventDefault: { (): void; (): void; }; stopPropagation: () => void; }) {
    if (event.keyCode === 27) {
      return;
    }

    if (event.keyCode === 40 || event.keyCode === 38) {
      this.selected = this.nextFoundResult(this.selected, event.keyCode === 38);

      return event.preventDefault();
    }

    if (event.keyCode === 9 || event.keyCode === 13) {
      if (this.hasFocus) {
        event.stopPropagation();
        event.preventDefault();
      }

      this.onSelect();
    } else {
      this.setFocus(true);
    }

    return true;
  }

  /**
   * Get the next result in the list.
   *
   * @param {Object}  current    selected item
   * @param {Boolean} [reversed] when true gets the previous instead
   *
   * @returns {Object} the next of previous item
   */
  nextFoundResult(current: any, reversed: boolean) {
    let index =
      (this.results.indexOf(current) + (reversed ? -1 : 1)) %
      this.results.length;

    if (index < 0) {
      index = this.results.length - 1;
    }

    return this.results[index];
  }

  /**
   * Set the text in the input to that of the selected item and set the
   * selected item as the value. Then hide the results(dropdown)
   *
   * @param {Object} [result] when defined uses the result instead of the this.selected value
   *
   * @returns {boolean}
   */
  onSelect(result = null) {
    // console.log(result);
    result = arguments.length === 0 ? this.selected : result;
    this.justSelected = true;
    this.value = this.label(result);
    this.previousValue = this.value;
    this.result = result;
    // this.initValue = '';
    this.selected = this.result.id || this.result.idx;

    this.setFocus(false);

    return true;
  }

  /**
   * when search string changes perform a request, assign it to results
   * and select the first result by default.
   *
   * @returns {Promise}
   */
  valueChanged() {
    if (!this.shouldPerformRequest()) {
      // console.log('req', this.resource)
      return Promise.resolve();
    }

    if (this.hasEnoughCharacters() && this.items) {
      // console.log('req chd', this.resource)
      this.results = [];
      // console.log(this.items)
      this.results = this.sort(this.filter(this.items));
      return Promise.resolve();
    }

    this.result = null;

    // when resource is not defined it will not perform a request. Instead it
    // will search for the first items that pass the predicate
    if (this.items) {
      this.results = this.sort(this.filter(this.items));
      return Promise.resolve();
    }

    let lastFindPromise = this.findResults(this.searchQuery(this.value)).then(
      (      results: any) => {
        if (this.lastFindPromise !== lastFindPromise) {
          return;
        }

        this.previousValue = this.value;
        this.lastFindPromise = false;
        this.results = this.sort(results || []);

        if (this.results.length !== 0) {
          // this.selected = this.results[0].id;
        }
      }
    );

    this.lastFindPromise = lastFindPromise;
    return;
  }

  /**
   * returns a list of length that is smaller or equal to the limit. The
   * default predicate is based on the regex
   *
   * @param {Object[]} items
   *
   * @returns {Object[]}
   */
  filter(items: any) {
    let results: any = [];

    items.some((item: any) => {
      // add an item if it matches
      if (this.itemMatches(item)) {
        results.push(item);
      }

      return results.length >= this.limit;
    });

    return results;
  }

  /**
   * returns true when the finding of matching results should continue
   *
   * @param {*} item
   *
   * @return {Boolean}
   */
  itemMatches(item: any) {
    // search matches if value
    if (this.value) {
      return this.regex.test(this.label(item));
    } else {
      return true;
    }
  }

  @computedFrom("value")
  get regex() {
    return new RegExp(this.value, "gi");
  }

  /**
   * returns true when a request will be performed on a search change
   *
   * @returns {Boolean}
   */
  shouldPerformRequest() {
    if (this.alwaysQuery) {
      return true;
    }

    if (this.justSelected === true) {
      this.justSelected = false;

      return false;
    }

    if (this.initial) {
      this.initial = false;

      return true;
    }

    return this.value !== this.previousValue;
  }

  /**
   * Returns whether or not value has enough characters (meets minInput).
   *
   * @returns {boolean}
   */
  hasEnoughCharacters() {
    return ((this.value && this.value.length) || 0) >= this.minInput;
  }

  /**
   * @param {Object} query a waterline query object
   *
   * @returns {Promise} which resolves to the found results
   */
  findResults(query: { populate: string; where: { [x: string]: { contains: any; }; }; limit: number; }) {
    return this.apiEndpoint
      .find(this.resource, query)
      .catch((err: any) => logger.error("not able to find results", err));
  }

  /**
   * Emit custom event, or call function depending on supplied value.
   *
   * @param {string} value
   */
  onFooterSelected(value: any) {
    if (typeof this.footerSelected === "function") {
      this.footerSelected(value);

      return;
    }

    this.element.dispatchEvent(
      DOM.createCustomEvent("footer-selected", {
        detail: {
          value
        }
      })
    );
  }

  /**
   * Takes a string and converts to to a waterline query object that is used to
   * perform a forgiving search.
   *
   * @param {String} string the string to search with
   *
   * @returns {Object} a waterline query object
   */
  searchQuery(string: string) {
    let mergedWhere = Object.assign(
      {
        [this.attribute]: {
          contains: string
        }
      },
      this.criteria
    );

    let query = {
      populate: this.populate || "",
      where: mergedWhere,
      limit: 30
    };

    // only assign limit to query if it is defined. Allows to default to server
    // limit when limit bindable is set to falsy value
    if (this.limit) {
      query.limit = this.limit;
    }

    return query;
  }

  activate() {
    this.valueChanged();
  }
}
