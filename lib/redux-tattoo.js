import setValue from "lodash.set";
const reduxTattooLocalStorageKey = "redux_tattoo_storage_key";
let tattooRegistry = {};

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

const getTattooValue = (persistedState, tattooSpecs) =>
    persistedState[tattooSpecs.key] === undefined
        ? tattooSpecs.default
        : persistedState[tattooSpecs.key];

class TattooSpecs {
    constructor(value) {
        const self = this;
        self.default = value;
        self.key = "";
    }

    setKey(namespace, path) {
        const self = this;
        self.key = [namespace, path].filter((s) => s).join(".");
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

        console.log("Updating local storage", newState);
        updateLocalStorage(newState);
    });
}

export function Tattoo(defaultValue) {
    return new TattooSpecs(defaultValue);
}

export function Stencil(stencilSpecs, namespace = "") {
    const hydratedObj = {};
    const persistedState = getReduxTattooStorage();
    const hydrateObj = (targetField, path) => {
        if (targetField !== undefined && targetField instanceof TattooSpecs) {
            const tattooSpecs = targetField;
            tattooSpecs.setKey(namespace, path);
            tattooRegistry[tattooSpecs.key] = tattooSpecs.default;
            setValue(hydratedObj, path, getTattooValue(persistedState, tattooSpecs));
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

export default { Stencil, Tattoo, attach };
