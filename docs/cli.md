### cli

#### Dependencies

{{dependencies}}

#### Arguments

{{arguments}}

#### Return value

{{returnValue}}

#### Description

- Parse CLI arguments from `process.argv`
- Set `eventId` from first non-option argument

- Use `find-up` to look for `emit.json`

  - If found, merge event config into args

- Find glob matches for `${cwd}/**/${eventId}.js`

  - Ignore `**/node_modules/**`
  - Prioritize matches within `dist/`

- If glob match found

  - Require highest priority composer

- If glob match not found

  - Require global package

- Require dynamic dependencies as they are emitted

  - First try to find dependency relative to event package
  - Then try to find dependency from global packages

- Emit event with prepared args
