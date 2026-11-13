# FTF theme source

This directory is the application's directly editable theme. `index.ts` assembles
local base and component token files; it does not import or extend upstream Aura.
Edit `base/index.ts` for palettes and shared values, or a component's `index.ts`
for that component. PrimeVue still supplies component behaviour, base CSS and
token generation. Dependencies and the `p` variable prefix are unchanged.

The starting material is Aura from **@primeuix/themes 1.2.5**, copyright 2025
PrimeTek, under the adjacent MIT `LICENSE`. It was recovered from the original
TypeScript `sourcesContent` distributed in that version's source maps. The local
backoffice installation supplied those artifacts; its application-specific theme
and styling were not copied. Internal Aura imports were replaced with relative
imports. Type-only imports use the installed package's public declarations.

FTF compatibility edits target **PrimeVue 5.0.2 / themes 3.0.1 / styled 1.0.0**:

- Adjust the old literal dimensions to the application's existing 16px baseline.
- Add documented typography, menu and component token sections introduced in v5.
- Keep shared token references, light/dark schemes and current visual states.
- Use `normal` for DataTable body font weight: the existing upstream token returns
  `0.875rem`, which is not a valid CSS font weight and falls back in the browser.

Compatibility values were authored against the public token declarations and
documented `$dt` API, with current appearance used as the baseline. The compiled
implementation or hidden source of themes 3.0.1 was not copied or decompiled.

The preset contains the 88 component token modules from the MIT starting point.
It covers the components currently used by this app, with a test against installed
public metadata. New v5-only components such as Gallery, InputTags and Sidebar
need local token modules before adoption. The test checks imports automatically;
it does not establish support for components the application has not adopted.

The MIT notice applies to the copied theme material. Installed PrimeVue/PrimeUIX
v5 runtime packages retain their own licenses and license-key requirements.
Nothing here removes or changes their verification mechanisms. This directory
is application customization, not a replacement runtime or a redistributed SDK.

Upstream sources:

- https://github.com/primefaces/primeuix/tree/main/packages/themes/src/presets/aura
- https://primevue.dev/theming/styled/
- https://primeui.dev/eula/commercial-per-developer
