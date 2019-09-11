/**
 * redux-tattoo <https://github.com/jahnestacado/redux-tattoo>
 * Copyright (c) 2019 Ioannis Tzanellis
 * Licensed under the MIT License (MIT).
 */
import { Stencil, Tattoo, attach, _clearTattooRegistry } from "./../lib/redux-tattoo.js";
import createLocalStorageMock from "./utils/local-storage-mock.js";
import createReduxStoreStub from "./utils/redux-store-stub.js";
import chai from "chai";
const expect = chai.expect;

describe("when testing the redux-tattoo module", () => {
    describe("when attaching the Redux store to Redux-Tattoo and the Redux state updates", () => {
        let reduxStoreStub;
        let localStorageMock;
        const reduxStateUpdate1 = {
            app: {
                token: undefined,
                username: "foo",
                info: {
                    telephone: 90008000,
                    address: "camelcase str",
                },
            },
        };
        beforeEach(() => {
            reduxStoreStub = createReduxStoreStub();
            localStorageMock = createLocalStorageMock({});
            // Define the Stencil in order to register the fields in the tattooRegistry
            Stencil(
                {
                    token: new Tattoo(null),
                    username: new Tattoo("unknown"),
                    info: new Tattoo({
                        telephone: null,
                        address: "",
                    }),
                },
                "app"
            );

            attach(reduxStoreStub);
            reduxStoreStub.triggerUpdate(reduxStateUpdate1);
        });

        afterEach(() => {
            localStorageMock.destroy();
        });

        it("should set the expected localStorage value", () => {
            expect(localStorageMock.value).to.deep.equal({
                storageKey: "redux_tattoo_storage_key",
                storedState:
                    '{"app.username":"foo","app.info":{"telephone":90008000,"address":"camelcase str"}}',
            });
        });

        describe("when the Redux state changes again", () => {
            const reduxStateUpdate2 = {
                app: {
                    token: "the-token",
                    username: "batman",
                    info: undefined,
                },
            };
            beforeEach(() => {
                reduxStoreStub.triggerUpdate(reduxStateUpdate2);
            });

            it("should set the expected localStorage value", () => {
                expect(localStorageMock.value).to.deep.equal({
                    storageKey: "redux_tattoo_storage_key",
                    storedState: '{"app.token":"the-token","app.username":"batman"}',
                });
            });
        });
    });

    const stencilScenarios = [
        {
            namespace: "global",
            localStorageState: {
                "global.numericValue": 9.99,
                "global.nullValue": null,
                "global.stringValue": "foo-bar",
                "global.topLevelObj": {
                    a: undefined,
                    b: null,
                },
                "global.secondLevelObj.tattooedVal": "realistic",
                "global.foo": "unused",
            },
            stencilDefaultValue: {
                numericValue: new Tattoo(0),
                stringValue: new Tattoo("default"),
                nullValue: new Tattoo("soon to be null..."),
                topLevelObj: new Tattoo({ a: "A-value", b: "B-value" }),
                secondLevelObj: {
                    tattooedVal: new Tattoo("traditional"),
                    trivialVal: "ink",
                },
                trivial: "Non tattooed field",
                trivialNested: { c: "C" },
            },
            expectedStencilResult: {
                numericValue: 9.99,
                stringValue: "foo-bar",
                nullValue: null,
                topLevelObj: { b: null },
                secondLevelObj: {
                    tattooedVal: "realistic",
                    trivialVal: "ink",
                },
                trivial: "Non tattooed field",
                trivialNested: { c: "C" },
            },
        },
        {
            namespace: undefined,
            localStorageState: {
                numericValue: 9.99,
                nullValue: null,
                stringValue: "foo-bar",
                topLevelObj: {
                    a: undefined,
                    b: null,
                },
                "secondLevelObj.tattooedVal": "realistic",
                foo: "unused",
            },
            stencilDefaultValue: {
                numericValue: new Tattoo(0),
                stringValue: new Tattoo("default"),
                nullValue: new Tattoo("soon to be null..."),
                topLevelObj: new Tattoo({ a: "A-value", b: "B-value" }),
                secondLevelObj: {
                    tattooedVal: new Tattoo("traditional"),
                    trivialVal: "ink",
                },
                trivial: "Non tattooed field",
                trivialNested: { c: "C" },
            },
            expectedStencilResult: {
                numericValue: 9.99,
                stringValue: "foo-bar",
                nullValue: null,
                topLevelObj: { b: null },
                secondLevelObj: {
                    tattooedVal: "realistic",
                    trivialVal: "ink",
                },
                trivial: "Non tattooed field",
                trivialNested: { c: "C" },
            },
        },
    ];

    stencilScenarios.forEach(
        ({ namespace, localStorageState, stencilDefaultValue, expectedStencilResult }) => {
            describe(`when creating a Stencil for the namespace: '${namespace}'`, () => {
                let localStorageMock;
                let stencil;
                beforeEach(() => {
                    localStorageMock = createLocalStorageMock(localStorageState);
                    stencil = Stencil(stencilDefaultValue, namespace);
                });

                afterEach(() => {
                    localStorageMock.destroy();
                    _clearTattooRegistry();
                });

                it("should return the expected object", () => {
                    expect(stencil).to.deep.equal(expectedStencilResult);
                });
            });
        }
    );
});
