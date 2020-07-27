# `react-capture-metrics`

<br />

<p align="center">
  <a aria-label="NPM version" href="https://www.npmjs.com/package/react-capture-metrics">
    <img alt="" src="https://badgen.net/npm/v/react-capture-metrics">
  </a>
  <a aria-label="Package size" href="https://bundlephobia.com/result?p=react-capture-metrics">
    <img alt="" src="https://badgen.net/bundlephobia/minzip/react-capture-metrics">
  </a>
  <a aria-label="License" href="https://github.com/zeit/swr/blob/master/LICENSE">
    <img alt="" src="https://badgen.net/npm/license/react-capture-metrics">
  </a>
</p>


## Table of Contents:
- [Introduction](#introduction)
- [Example](https://codesandbox.io/s/github/stackshirts/react-capture-metrics/tree/master/examples/with-nextjs)
- [Quick Start](#Quick Start)
- [Mount MetricsProvider](#Mount MetricsProvider)
- [useMetrics](#useMetrics)
    - [PageView](#PageView)
    - [Capture](#Capture)
    - [analytics](#analytics)


## Introduction

The `react-capture-metrics` package is a small **react** library to help pass properties to your analytics via context.

The problem it solves is probably best demonstrated in an example. (Or check out the [Code Sandbox](https://codesandbox.io/s/github/stackshirts/react-capture-metrics/tree/master/examples/with-nextjs))

```javascript
  // Deep down at the most granular level of your react app
  // you want to track a button click

  <button onClick={analytics.track('Add to cart')}>
    Add to cart
  </button>

  // But you also want to know which product, 
  // by which user, 
  // on which page, 
  // in which variant of an a/b test and more

  <button onClick={analytics.track('Add to cart', {
    user: { /* user props */ },
    variantId,
    pageName, // document.title might change with other copy
    utmCode,
    productRankInList,
    /// ...and more!
  })}>
    Add to cart
  </button>
```

All those extra properties would lead to a lot of prop-drilling or superfluous use of react context. This solves that problem.

Instead, we add properties throughout the virtual DOM and properties get passed down to nested components via context. It sort of imitates [Event bubbling and capture](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture). Hence, the name - we are capturing properties down the DOM tree hierarchy. 

For example:
- Get `utmCode` from `app.tsx`
- Get `sessionId` from `auth.tsx`
- Get `user` from `user.tsx` 
- Get `variantId` from `page.tsx`

Then in your `button` you only have to call:
 
```
<button onClick={analytics.track('Add to cart')}>
  Add to cart
</button>
```

## Example
[Code Sandbox](https://codesandbox.io/s/github/stackshirts/react-capture-metrics/tree/master/examples/with-nextjs)

## Quick Start

Inside your React project directory, run the following:

```
yarn add react-capture-metrics
```

Or with npm:

```
npm install react-capture-metrics
```

## Mount MetricsProvider

```js
import { MetricsProvider } from 'react-capture-metrics'

const analytics = {
  track: (name, properties) => window.analytics.track(name, properties),
  page: (name, properties, category) => window.analytics.page(...(category ? [category, name, properties] : [name, properties]))
}

function App () {
  return (
    <MetricsProvider analytics={analytics} properties={{ appVersion: pkg.version }}>
      // ...the rest of your app
    </MetricsProvider>
  )
}
```

In the above example, an analytics object (with `track` and `page` methods) that conforms to the `react-capture-metrics` spec, and translates to the Segment API specification. 

** Note that `analytics` should be defined outside of component or via a `ref` because `MetricsProvider` will not watch for updates.

## useMetrics()

```js
import { useMetrics } from 'react-capture-metrics';

function Page() {
  const { 
    analytics,
    Capture,
    PageView,
    ready,
  } = useMetrics({ 
    // ...properties to pass down
  })
}
```

#### Parameters

- `properties`: all properties you want to "inject" into the DOM hierarchy (using the `Capture` or `PageView` components that get returned)
- `config`: (_optional_) 
    - `ready`: (_optional_) `boolean` to defer any PageView events until parent properties have been determined.

#### Return Values
- `analytics`: data for the given key resolved by `fetcher` (or undefined if not loaded)  
- `Capture`: data for the given key resolved by `fetcher` (or undefined if not loaded)  
- `PageView`: error thrown by `fetcher` (or undefined)  
- `ready`: if there's a request or revalidation loading  


## PageView

```js

function Page() {
  const { PageView } = useMetrics({
    variantId, 
    // ...properties to capture
  }, { ready: variantId !== undefined })
  return (
    <PageView 
      name="Home"
      category="Customer"
      ready={/* some useState value perhaps */ }
    >
      // ...
    </PageView>
  )  
}
```

This will call `analytics.page()` when it is rendered (in a `useEffect`). Note the use of the `ready` option in `useMetrics` as well as on the `PageView` component. This will defer the page event until **all** "captured" `ready` properties are true. In this case, it will wait until variantId is loaded (asyncronously perhaps).

PageView is also similar to the `Capture` component in that it captures all properties in context to be used deeper in the (virtual) DOM tree.

## Capture

```js

function Card({ productId }) {
  const { Capture } = useMetrics({
    productId,  
    // ...properties to capture  
  })
  return (
    <Capture>
      // ...
    </Capture>
  )  
}
```

This will capture all the properties provided to `useMetrics` and pass them via context to any nested calls to `useMetrics`.

## analytics

This object has the same implementation as the `analytics` object you passed to [MetricsProvider](#Mount MetricsProvider).

### `analytics.track(name, properties)`

```js

function Card({ productId }) {
  const { analytics } = useMetrics({
    // ...properties to capture  
  })
  return (
    <button 
      onClick={() => analytics.track('Button clicked', {
        // ...additional properties to bubble up
      })}
    >
      // ...
    </button>
  )  
}
```

Use the `analytics` object to imperatively send a tracking event (`page()` works also). Any properties you pass will be merged with those that have been "captured" higher in the virtual DOM.

### `analytics.page(name, properties, category)`

```js

function LandingPage() {
  const { analytics } = useMetrics({
    // ...properties to capture  
  })
  useEffect(() => {
    analytics.page('Landing page', { /* ...other properties */ }, 'Category')
  }, [])
}
```
