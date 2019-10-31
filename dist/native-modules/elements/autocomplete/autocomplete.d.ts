import "./autocomplete.css";
export declare class AutoCompleteCustomElement {
    application: string;
    apiEndpoint: any;
    element: any;
    lastFindPromise: boolean;
    justSelected: boolean;
    previousValue: any;
    initial: boolean;
    hasFocus: boolean;
    offline: boolean;
    showEdit: boolean;
    showNew: boolean;
    alwaysQuery: boolean;
    minInput: number;
    name: string;
    limit: number;
    debounce: number;
    initValue: string;
    resource: any;
    items: any;
    value: string;
    selected: any;
    attribute: string;
    result: any;
    results: any;
    populate: string;
    footerLabel: string;
    footerSelected: any;
    footerVisibility: string;
    label: (result: any) => any;
    endpoint: any;
    placeholder: string;
    sort: (items: any) => any;
    criteria: {};
    readonly showFooter: boolean | "" | 0;
    /**
     * Autocomplete constructor.
     *
     * @param {Config}  api
     * @param {Element} element
     */
    constructor(api: any, element: any);
    /**
     * Bind callback.
     *
     * @returns {void}
     */
    bind(): void;
    /**
     * Set focus on dropdown.
     *
     * @param {boolean} value
     * @param {Event}   [event]
     *
     * @returns {boolean}
     */
    setFocus(value: boolean, event?: any): boolean;
    /**
     * returns HTML that wraps matching substrings with strong tags.
     * If not a "stringable" it returns an empty string.
     *
     * @param {Object} result
     *
     * @returns {String}
     */
    labelWithMatches(result: any): string;
    /**
     * Handle keyUp events from value.
     *
     * @param {Event} event
     *
     * @returns {*}
     */
    handleKeyUp(event: {
        keyCode: number;
        stopPropagation: () => void;
    }): true | undefined;
    /**
     * Handle keyDown events from value.
     *
     * @param {Event} event
     *
     * @returns {*}
     */
    handleKeyDown(event: {
        keyCode: number;
        preventDefault: {
            (): void;
            (): void;
        };
        stopPropagation: () => void;
    }): true | void;
    /**
     * Get the next result in the list.
     *
     * @param {Object}  current    selected item
     * @param {Boolean} [reversed] when true gets the previous instead
     *
     * @returns {Object} the next of previous item
     */
    nextFoundResult(current: any, reversed: boolean): any;
    /**
     * Set the text in the input to that of the selected item and set the
     * selected item as the value. Then hide the results(dropdown)
     *
     * @param {Object} [result] when defined uses the result instead of the this.selected value
     *
     * @returns {boolean}
     */
    onSelect(result?: null): boolean;
    /**
     * when search string changes perform a request, assign it to results
     * and select the first result by default.
     *
     * @returns {Promise}
     */
    valueChanged(): Promise<void> | undefined;
    /**
     * returns a list of length that is smaller or equal to the limit. The
     * default predicate is based on the regex
     *
     * @param {Object[]} items
     *
     * @returns {Object[]}
     */
    filter(items: any): any;
    /**
     * returns true when the finding of matching results should continue
     *
     * @param {*} item
     *
     * @return {Boolean}
     */
    itemMatches(item: any): boolean;
    readonly regex: RegExp;
    /**
     * returns true when a request will be performed on a search change
     *
     * @returns {Boolean}
     */
    shouldPerformRequest(): boolean;
    /**
     * Returns whether or not value has enough characters (meets minInput).
     *
     * @returns {boolean}
     */
    hasEnoughCharacters(): boolean;
    /**
     * @param {Object} query a waterline query object
     *
     * @returns {Promise} which resolves to the found results
     */
    findResults(query: {
        populate: string;
        where: {
            [x: string]: {
                contains: any;
            };
        };
        limit: number;
    }): any;
    /**
     * Emit custom event, or call function depending on supplied value.
     *
     * @param {string} value
     */
    onFooterSelected(value: any): void;
    /**
     * Takes a string and converts to to a waterline query object that is used to
     * perform a forgiving search.
     *
     * @param {String} string the string to search with
     *
     * @returns {Object} a waterline query object
     */
    searchQuery(string: string): {
        populate: string;
        where: {
            [x: string]: {
                contains: string;
            };
        };
        limit: number;
    };
    activate(): void;
}
