export default function createReduxStoreStub() {
    const stubbedStore = {
        triggerUpdate(state) {
            stubbedStore.getState = () => state;
            stubbedStore.listener();
        },
        subscribe(listener) {
            stubbedStore.listener = listener;
        },
    };

    return stubbedStore;
}
