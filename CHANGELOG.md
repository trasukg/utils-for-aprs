# utils-for-aprs

## 3.1.0

### Minor Changes

- af88326: In some cases the library emits messages to the console, which is not appropriate for a library. This change makes it so the error handling passes errors back to callers of the library, with no output generated directly.

## 3.0.4

### Patch Changes

- 10b6486: Update to publishing workflow.

## 3.0.3

### Patch Changes

- a8fa0e7: No real change, just added automated publishing to npm with provenance.

## 3.0.2

### Patch Changes

- 9e66753: Add in the changeset action.
- f360152: Update dependencies to remove some vulnerabilities. Any that remain are in the dev dependencies. They are results of including gulp-jsdoc3, which hasn't been updated for quite a while. At some point, we'll look at how to generate documentation in some modern way, probably removing gulp entirely, but they are no harm at the present time.
