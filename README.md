# Nonflowers

Procedurally generated paintings of nonexistent flowers in Gongbi style, originally created by [Lingdong Huang](https://github.com/LingDong-/nonflowers). This fork uses **TypeScript, p5.js, and Vite**, with an optional layered fish generator using **p5.brush**.

![Sample output from the original project](/screenshots/screen01.jpg)

## Run locally

Use Node.js 20.19+ or 22.12+ (including newer releases).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The DialKit panel generates a new painting, downloads a PNG, edits the seed and manual parameters, and copies a shareable URL. A URL such as `?seed=my-flower` reproduces the same painting. Seeds support Unicode and URL punctuation.

## Seed and manual modes

Use the **Nonflowers** DialKit panel and choose **Seed** or **Manual** under **Generation mode**.

- **Seed** preserves the original generator: a 50/50 woody/herbaceous choice followed by sampled parameter ranges. Enter a seed and press **Generate** to reproduce a painting.
- **Manual** starts with the current painting's parameters. Expand the groups to edit plant type, leaves and veins, flowers and petals, stems and shoots, branch geometry, shape curves, color ranges (HSV and opacity), paper, border, and noise. Sliders and numeric inputs apply changes after a short delay; **Generate** applies the current seed and controls again. Counts and probabilities can disable features; controls for a different plant type take effect when that type is selected.

Manual settings control the plant parameters, while the seed still determines the placement, small variations, and procedural detail. Changing a metric does not change the seed. The manual settings are included in the URL, so reloading or sharing the URL restores the same configuration. **New painting** returns to a new seed-generated painting. **Download PNG** exports the image and **Copy share link** copies a URL that restores it.

DialKit's framework-free controller and built-in floating panel own all controls and actions. Its official vanilla stylesheet is loaded without custom themes, overrides, or replacement controls. Editing a plant metric automatically switches to Manual mode. Manual mode also makes previously unused center width/shape parameters effective, applies branch colors to child branches, and uses exact shoot counts. Seed mode preserves the earlier paintings.

## Layered fish paintings

Choose **Subject → Fish**, or open `?subject=fish&seed=river`. Use **Fish recipes** for silver stripes, reef bars, koi patches, spotted river fish, ringed fins and reaction–diffusion starting points. Seed and Manual modes, share URLs and PNG downloads work for both subjects.

Fish have nine individually controlled regions and interacting pigment, dark marking, pale marking, reflection, scale, fin and watercolor layers. Analytical motifs can combine with an actual worker-based Gray–Scott simulation on the fish silhouette. The stock DialKit panel also exposes diagnostic layer views. Page and DialKit styling are unchanged.

See the [control and implementation guide](docs/fish-generator.md) and the [primary-source research on fish coloration and pattern formation](docs/fish-coloration-research.md). The renderer is an artistic model informed by that research, not a validated biological simulation. Final fish brushwork requires WebGL2; exact GPU texture pixels may differ across devices.

## Build and verify

```sh
npm run typecheck
npm run build
npm run preview
```

The production site is generated in `dist/`. Vite uses relative asset paths so the build can be served from a subdirectory, including `/nonflowers/`. Deploy the contents of `dist/`, rather than the source directory. No backend is required.

For browser tests, install Chromium once:

```sh
npx playwright install chromium
npm test
```

`npm test` builds the production site and runs Playwright checks for rendered pixels, deterministic seeds, different outputs across seeds, Unicode seed navigation, sharing, PNG downloads, regeneration, mobile layout, runtime errors, manual edits, manual URL restoration, control bounds, and switching back to Seed mode. `npm run format:check` checks formatting.

## Implementation

The entry point only mounts the application; UI code does not participate in plant generation. The renderer returns a painting, paper background, and parameters/control settings through `createGenerator(sketch).render(seed, optionalManualSettings)` and releases its temporary p5 buffers before returning.

| Module                                                          | Responsibility / extension point                                       |
| --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/main.ts`, `src/app.ts`                                     | Application startup, sketch lifecycle, loading and error states        |
| `src/ui/controls.ts`, `src/ui/location.ts`                      | Stock DialKit panel, seed/manual values, actions, and shareable URLs   |
| `src/ui/download.ts`                                            | Compositing and downloading PNGs                                       |
| `src/rendering/generator.ts`                                    | Seeded rendering pipeline and plant selection                          |
| `src/rendering/parameters.ts`                                   | Plant proportions, colors, and shape curves                            |
| `src/rendering/plants.ts`                                       | Woody and herbaceous plant recipes                                     |
| `src/rendering/structures.ts`                                   | Reusable leaf, stem, and recursive branch algorithms                   |
| `src/rendering/drawing.ts`                                      | Polygon and brush drawing, tube geometry, paper texture                |
| `src/rendering/layers.ts`, `src/rendering/filters.ts`           | p5 buffer ownership, compositing, and pixel effects                    |
| `src/rendering/math.ts`, `vectors.ts`, `colors.ts`, `random.ts` | Geometry, color conversion, and deterministic random helpers           |
| `src/rendering/types.ts`, `src/rendering/canvas.ts`             | Shared drawing options and plain canvas operations                     |
| `style.css`                                                     | Painting layout and loading indicator; DialKit uses its own stylesheet |

To add a manual metric, declare it in `settings.ts` and consume it in `manual.ts` or the relevant rendering module; the DialKit panel picks up the schema automatically. To add a plant recipe, compose the structures in `plants.ts` and select it in `generator.ts`. To change the range of generated flowers, edit `parameters.ts`; to change brushwork or paper, edit `drawing.ts` or `filters.ts`. Drawing destinations are explicit arguments, and rendering modules have no dependency on UI elements or event handlers. Pass the same p5 instance through the rendering pipeline to preserve the seeded random sequence.

All application code, build configuration, and tests are TypeScript. HTML and CSS provide the page structure and styling. The original global modifications to `Math` and `Array.prototype` have been removed.

The original plant algorithms and painted texture effects are retained, but **old seeds produce different paintings** because this version uses p5's random generator and seeded noise. Within this version, a seed reproduces its painting.

## Original project

Nonflowers attempts to capture the structures of plants and the delicate brushstrokes of [Gongbi paintings](https://en.wikipedia.org/wiki/Gongbi) through mathematical functions and procedural noise. Parameterization and randomization create a wide variety of plants without preexisting flower imagery.

The original project's full description is available [here](https://drive.google.com/file/d/1g1gVmRKdn4He0fgavvKt54tb6HmMYANU/view).

MIT license; original algorithms copyright Lingdong Huang, 2018. See [LICENSE](LICENSE).
