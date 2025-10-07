---
"utils-for-aprs": minor
---

In some cases the library emits messages to the console, which is not appropriate for a library. This change makes it so the error handling passes errors back to callers of the library, with no output generated directly.
