# decision-engine-node

A TypeScript library for building and evaluating **decision contexts** in
Node.js — model the inputs a decision relies on, declare dependencies between
them fluently, and evaluate a context through a single service.

## Concepts
- **DecisionContext** — the central model of a decision and its inputs
- **Fluent builders** — `ReliesOnBuilder` / `ReliesOnWithBuilder` declare what a
  decision relies on, and what it relies on it *with*, in readable chains
- **DecisionContextService** — evaluation entry point over a context
- **ContextConfigManager** — manages configuration for contexts
- Built on **RxJS** for reactive evaluation

## Usage sketch
```ts
import { DecisionContext /* ... */ } from './src';

// Build a context, declare its dependencies with the fluent builders,
// configure it via ContextConfigManager, and evaluate it through
// DecisionContextService. See src/ and the specs for worked examples —
// every module ships with a *.spec.ts that doubles as usage documentation.
```

## Development
```bash
npm install
npm run build    # tsc
npm test         # Jest (ts-jest) — specs sit next to the modules they cover
npm run format   # Prettier
```

TypeScript 5.8, Jest 29. Package entry point is built from `src/index.ts`.
