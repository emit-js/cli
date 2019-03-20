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

- Use `find-up` to look for `dot.json`

  - If found, merge event config into args

- Find glob match `${path}/**/${eventId}.js`

  - Ignore `**/node_modules/**`
  - Prioritize matches within `dist/`

- If glob match found

  - Require highest priority composer

- If glob match not found

  - Require global package

- Emit event with prepared args
