[![NPM version](http://img.shields.io/npm/v/redux-tattoo.svg)](https://www.npmjs.org/package/redux-tattoo)
[![Build Status](https://travis-ci.org/jahnestacado/redux-tattoo.svg?branch=master)](https://travis-ci.org/jahnestacado/redux-tattoo)
[![downloads per month](http://img.shields.io/npm/dm/redux-tattoo.svg)](https://www.npmjs.org/package/redux-tattoo)

# redux-tattoo

Simple and expressive way to bind redux state to localStorage.

## Motivation

Existing libraries that bind redux state to localStorage for the most part are more complicated than they should and do unnecessary dehydrations. Morever they are heavily dependent on implementation details of redux which limits version compatibility.

This module is a an expressive way to define which properties of your reducers state needs to be persisted and synced with localStorage. Essentially you create a `stencil` by providing an object(your reducer state) that can potentially hold `Tattoo` instances. A `Tattoo` is just a placeholder with a default value and can be used to mark which properties needs to be peristed/synced.

## Install

```sh
npm install --save redux-tattoo
```

## Usage

_reducer.js_

```js
import produce from "immer";
import { LOGIN_SUCCESS, LOGIN_FAILURE } from "./constants";
import { stencil, Tattoo } from "redux-tattoo";

// create Tattoo with default value of the relevant property
const sessionTattoo = new Tattoo({});

// create a stencil and define which properties will persist/load to/from localStorage
// essentially any property inside the stencil that is of type Tattoo will be
// stored to localStorage and upon initialization of the initialState if there is already a value stored for that property it will be loaded instead of the Tattoo default value
export const initialState = stencil(
    {
        session: sessionTattoo, // It evalutes to the last stored value in localStorage otherwise to the default value, in this case an empty object
    },
    "global" // optional namespace definition
);

const reducer = (state = initialState, action) =>
    produce(state, (draft) => {
        switch (action.type) {
            case LOGIN_SUCCESS:
                draft.session = action.session;
                break;
            case LOGOUT_SUCCESS:
                draft.session = sessionTattoo.default;
                break;
        }
    });

export default reducer;
```

The namespace is a selector path that points to the place of the reducer state in the redux store.

In the example above we use the 'global' namespace. This will target the global property of the current redux store state

```js
const reduxStoreState =  store.getState();

console.log(reduxStoreState);

// printed value of reduxStoreState
{
  global: {
    session: {}, // this is the targeted property from the code above
  }
}

```

We can further target nested properties by defining dot seperated paths e.g `global.session`.

In order to listen for state changes and update the localStorage accordingly we need to `attach` redux-tattoo to our applications redux store.

```js
import reduxTattoo from 'redux-tatoo';
import { createStore } from 'redux';

const store = createStore(...);

reduxTattoo.attach(store, {throttleInterval: 200});

```

As we can see it also provides an optional throttling mechanism in order to avoid unnecessary writes to localStorage since this is a synchronous operation.

## API

---

### Module default exports

```js
export default { stencil, Tattoo, attach };
```

---

### stencil(reducerInitialState, namespace)

A function that syncs all `Tattoo` properties from the reducer state with the localStorage object.

##### _Arguments_

`reducerInitialState - [Object]`

`namespace - {Optional}[String]`

##### _Returns_

The synced reducer state object with the localStorage.

---

### Tattoo(defaultValue)

A class that instantiates Tattoos. Tattoos are used by a `stencil` to mark which properties will be synced in localStorage.

##### _Arguments_

`defaultValue - [Object]`

---

### attach(reduxStore, options)

A functions that attaches redux-tattoo to the reduxStore in order to listen for state changes.

##### _Arguments_

`reduxStore - [Object]`

`options - {Optional}[Object] of format: { throttleInterval:[Integer] in millis}`

## Run tests

```sh
npm test
```
