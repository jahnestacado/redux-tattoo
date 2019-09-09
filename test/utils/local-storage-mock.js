export default function createLocalStorageMock(state = {}) {
    const mockState = {
        value: null,
        destroy() {
            global.window = null;
        },
    };
    global.window = {
        localStorage: {
            getItem(key) {
                if (key === "redux_tattoo_storage_key") {
                    return JSON.stringify(state);
                }
            },
            setItem(storageKey, storedState) {
                mockState.value = { storageKey, storedState };
            },
        },
    };

    return mockState;
}
