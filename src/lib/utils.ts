/**
 * `cn` is the design system's, re-exported here rather than reimplemented.
 *
 * The path has to stay `@/lib/utils`: `components.json` names it as the `utils`
 * alias, so every primitive `npx shadcn add` generates will import `cn` from
 * here. Keeping the module and swapping its body for a re-export gives one
 * implementation without touching ~38 call sites or breaking the CLI.
 */
export { cn } from '@dimitrisafendras/liquid-glass'
