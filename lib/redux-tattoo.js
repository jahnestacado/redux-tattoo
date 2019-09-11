/**
 * redux-tattoo <https://github.com/jahnestacado/redux-tattoo>
 * Copyright (c) 2019 Ioannis Tzanellis
 * Licensed under the MIT License (MIT).
 */
import setValue from "lodash.set";
const reduxTattooLocalStorageKey = "redux_tattoo_storage_key";
let tattooRegistry = {};
const lockSymbol = Symbol("redux-tattoo-lock");

export function Stencil(stencilSpecs, namespace = "") {
    const hydratedObj = {};
    const persistedState = getReduxTattooStorage();

    const hydrateObj = (targetField, path) => {
        if (targetField !== undefined && targetField instanceof Tattoo) {
            const tattoo = targetField;
            tattoo._setKey(namespace, path, lockSymbol);
            tattooRegistry[tattoo.key] = tattoo.default;
            setValue(hydratedObj, path, getTattooValue(persistedState, tattoo));
        } else if (targetField !== null && typeof targetField === "object") {
            setValue(hydratedObj, path, targetField);
            Object.keys(targetField).forEach((key) => {
                const subfieldPath = [path, key].join(".");
                hydrateObj(targetField[key], subfieldPath);
            });
        } else {
            setValue(hydratedObj, path, targetField);
        }
    };

    Object.keys(stencilSpecs).forEach((key) => {
        hydrateObj(stencilSpecs[key], key);
    });

    return hydratedObj;
}

export class Tattoo {
    constructor(value) {
        const self = this;
        self.default = value;
        self.key = "";
    }

    _setKey(namespace, path, lock) {
        const self = this;
        if (lock === lockSymbol) {
            self.key = [namespace, path].filter((s) => s).join(".");
        } else {
            console.warn(
                `redux-tattoo: Tattoo.setKey invocation has no effect outside the context of redux-tattoo`
            );
        }
    }
}

export function attach(store) {
    store.subscribe(() => {
        const currentState = store.getState() || {};
        const newState = {};
        const constructNewState = (target, path) => {
            if (path in tattooRegistry) {
                newState[path] = target;
            }
            if (target !== null && typeof target === "object") {
                Object.keys(target).forEach((key) => {
                    constructNewState(
                        target[key],
                        [path, key].filter((s) => s).join("."),
                        newState
                    );
                });
            }
        };

        Object.keys(currentState).forEach((key) => {
            constructNewState(currentState[key], key);
        });

        updateLocalStorage(newState);
    });
}

const updateLocalStorage = (state) => {
    window.localStorage.setItem(reduxTattooLocalStorageKey, JSON.stringify(state));
};

// This is only for testing purposes
export function _clearTattooRegistry() {
    tattooRegistry = {};
}

const getReduxTattooStorage = () => {
    let state = {};
    try {
        state = JSON.parse(window.localStorage.getItem(reduxTattooLocalStorageKey) || "{}");
    } catch (err) {
        console.log(err);
    }
    return state;
};

const getTattooValue = (persistedState, tattoo) =>
    persistedState[tattoo.key] === undefined ? tattoo.default : persistedState[tattoo.key];

export default { Stencil, Tattoo, attach };
