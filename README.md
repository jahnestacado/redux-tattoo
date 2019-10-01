[![NPM version](http://img.shields.io/npm/v/redux-tattoo.svg)](https://www.npmjs.org/package/redux-tattoo)
[![Build Status](https://travis-ci.org/jahnestacado/redux-tattoo.svg?branch=master)](https://travis-ci.org/jahnestacado/redux-tattoo)
[![downloads per month](http://img.shields.io/npm/dm/redux-tattoo.svg)](https://www.npmjs.org/package/redux-tattoo)

# redux-tattoo

Bind redux state to localStorage

## Install

`npm install --save redux-tattoo`

## Usage

_reducer.js_


```js
import produce from 'immer';
import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
} from './constants';
import { Stencil, Tattoo } from 'redux-tattoo';

// create Tattoo with default value of the relevant property
const sessionTattoo = new Tattoo({});

// create a Stencil and define which properties will persist/load to/from localStorage
// essentially any property inside the Stencil that is of type Tattoo will be
// stored to localStorage and upon initialization of the initialState if there is already a value stored for that property it will be loaded instead of the Tattoo default value
export const initialState = Stencil(
  {
    session: sessionTattoo,
  },
  'global', // optional namespace definition. This is optional
);

const reducer = (state = initialState, action) =>
  produce(state, draft => {
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

The namespace is a path that points to the place of the reducer state in the redux store

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

We need to `attach` the redux-tattoo to our applications redux store in order to listen for state changes and update the localStorage accordingly. It also provides a throttling mechanism in order to avoid unnecessary writes to localStorage since it is a synchronous operation.

```js
import reduxTattoo from 'redux-tatoo';
import { createStore } from 'redux';

const store = createStore(...);

reduxTattoo.attach(store, {throttleInterval: 200});

```

## API

---

### Module default exports

```js
export default { Stencil, Tattoo, attach }
```

---

### Stencil(reducerInitialState, namespace)

A function that syncs the reducerInitialState properties to localStorage. All properties that hold as a value a `Tattoo` instance will be synced with localStorage.

#### Arguments

`reducerInitialState - [Object]`
`namespace - [String] Optional`

---

### Tattoo(defaultValue)

A class that instantiates Tattoos. Tattoos are used by a `Stencil` to mark which properties will be synced in localStorage.

#### Arguments

`defaultValue - [Object]`

#### Returns

`Tattoo instance - [Object] of format: { default:[Object] }`

---

### attach(reduxStore, options)

A functions that attaches redux-tattoo to the reduxStore in order to listen for state changes.

#### Arguments

`reduxStore - [Object]`
`options - [Object] of format: { throttleInterval:[Integer] in millis}`

## Run tests

`npm test`
