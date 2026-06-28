---
title: Your API Client Is One Typo Away From Leaking a Token
author: Toufiqur Rahaman Chowdhury
# For dev.to set "published" to "true"
published: 2026-06-28
updated: 2026-06-28
tags: [fetch, api, client, axios]
canonical_url: https://alien45.github.io/journal/2026-06-28-fetch-api-client/
---

<h2 class="page-title">
Your API Client Is One Typo Away From Leaking a Token
</h2>

<h3 class="page-subtitle">
  Most API clients merge defaults. This one sandboxes them.
</h3>

_Author: [Toufiqur Rahaman Chowdhury](https://alien45.github.io/cv)_ • Published: 2026-06-28 • [← Back to Journal Home](../)

---

<img
 alt="Image showing the solution to the potential problem of having global fetch defaults"
 class="hide-on-mobile hide-on-tablet"
 src="./assets/problem-solution-wide.png"
/>
<img
 alt="Image showing the solution to the potential problem of having global fetch defaults"
 class="hide-on-desktop"
 src="./assets/problem-solution.png"
/>

## The Problem

You set up an API client once, with sane defaults:

- a base URL,
- an auth header,
- a timeout.

Every part of your app uses it.

Then your app grows. Now you're calling three different services.

- One needs a different auth scheme.
- Second one has its own timeout requirements.
- Third one should never, under any circumstance, accidentally pick up the Authorization header meant for a different host.

With most fetch wrappers, "default" means "global". Set it once, and it quietly applies everywhere, including places you didn't intend.

This is a documented, known footgun in popular libraries. Axios's own docs warn about it directly:

[
![Axios warning: if your app talks to more than one domain, a global default Authorization header gets sent to all of them, including third-party APIs you do not control.](./assets/axios-global-header-warning.jpg)
](https://axios.rest/pages/advanced/config-defaults#config-defaults)

Their recommended fix is discipline. You must always remember to scope a custom instance for any client that carries credentials.

Multi-service apps are especially exposed. A token meant for one host can leak into requests for another, because there was never a hard wall between them, just a shared default object.

Here's how it actually happens. Somewhere early in the app, someone sets a convenient global default:

```js
axios.defaults.headers.common["Authorization"] = "Bearer users-service-token";
```

Months later, a different part of the codebase calls a completely unrelated service:

```js
axios.get("https://products-api.example.com/items");
```

No error. No warning. The users-service token just went out on a request to products-api. Nobody touched that line of code expecting it to carry credentials for a different service, it inherited them silently because that's exactly what global defaults are designed to do.

_Global defaults reduce repetition, but they don't isolate you from the rest of your app._

## The Solution

When I built `ApiClient` in `@superutils/fetch`, I wanted each service my app talks to to live in its own sandbox, with zero chance of inheriting config it never asked for.

```js
import { ApiClient } from "@superutils/fetch";

const usersApi = new ApiClient("https://dummyjson.com/users", {
  fixedOptions: {
    headers: { Authorization: "Bearer users-service-token" },
  },
  commonOptions: {
    timeout: 5000,
  },
});

usersApi.get("/1");
usersApi.post("/add", { firstName: "Alice" });
```

By default, this instance ignores `fetch.defaults` entirely. Nothing set globally elsewhere in your app leaks in. `commonOptions` can be overridden per call when you need that flexibility. `fixedOptions` sit at a higher tier: at the call site, you can't pass conflicting options for them, the compiler stops you in TypeScript, and at runtime in JavaScript the fixed values simply win.

Need a second service with completely different rules?

```js
const productsApi = new ApiClient("https://dummyjson.com/products", {
  fixedOptions: {
    headers: { Authorization: "Bearer products-service-token" },
  },
});
```

Two clients, two isolated configs, no shared state, no risk of one token ending up on the wrong host.

You also get the full method suite on each instance, with every method locking in its own HTTP verb so you can't call `.get()` and accidentally send a POST. It's as if each `ApiClient` instance is a mini SDK for that service.

```js
usersApi.get("/1"); // GET, always
usersApi.post("/add"); // POST, always
usersApi.delete("/1"); // DELETE, always
```

Beyond isolation, the client also provides a few quality-of-life improvements:

- ✅ Full REST method suite (`get`, `post`, `put`, `patch`, `delete`, `head`, `options`) on every instance, each enforcing its own verb
- ✅ Isolation from global `fetch.defaults` by default
- ✅ Fixed options that win by default, with no accidental override path at the call site
- ✅ Per-instance error prefixing for easier debugging across services
- ✅ Automatic base URL joining

A multi-service client isn't the only use case, but it's the most common one:

- Talking to your own API plus one or more third-party APIs in the same app
- Separate internal microservices with different auth requirements
- Multi-tenant apps where each tenant needs a sandboxed client
- Public SDKs where you can't trust the consumer's global fetch config
  Global defaults reduce repetition. Isolated defaults prevent surprises.

How are you isolating config between the different APIs your app talks to?

## Check out @superutils/fetch

- [**NPM**](https://www.npmjs.com/package/@superutils/fetch)
- [**Documentation & playground**](https://alien45.github.io/superutils/packages/@superutils/fetch/)
- [**Source Code**](https://github.com/alien45/superutils/tree/main/packages/fetch)

<!-- ## Related Discussions

This article is also shared on the following platforms, where you can comment, like, or reshare:

- [LinkedIn](https://www.linkedin.com/feed/update/...........)
- [dev.to](https://dev.to/alien45/..........)
- [X (Twitter)](https://x.com/toufiq1618/status/.........) -->

### 👤 About the Author

Toufiqur Rahaman Chowdhury is a full-stack software developer with over 8 years of experience building scalable web applications. He’s worked across frontend, backend, and blockchain systems.

🔗 [← Back to Journal Home](../)
• [CV](https://alien45.github.io/cv)
• [LinkedIn](https://www.linkedin.com/in/toufiq/)
• [GitHub](https://github.com/alien45)
• [Contact / Hire Me](https://alien45.github.io/cv/Toufiqur_Chowdhury_CV.pdf)

<link rel="stylesheet" href="../assets/style.css" />
<script type="text/javascript" src="../assets/script.js"></script>
