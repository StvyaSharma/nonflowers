# Fish generator: controls and implementation

Choose **Subject → Fish** in the existing DialKit panel, or open `?subject=fish&seed=river`. Plants remain the default. All generation stays in the browser. The page layout, painting dimensions and stock DialKit stylesheet are unchanged.

## Starting a painting

**Seed** resolves a repeatable recipe from the seed. **Manual** exposes the resolved values, and changing a metric switches to Manual. **Fish recipes** offers silver stripes, reef bars, koi patches, spotted river fish, ringed fins, reaction spots and a reaction maze. These are visual starting points, not reconstructions of named species. Recipe buttons select Fish and Manual while retaining the current seed. **New painting** samples a new seed for the selected subject.

Manual settings and subject are serialized in the share URL. PNG downloads include the paper and use a `nonfishes-<seed>.png` filename. The seed still controls initialization, brush variation and paper grain in Manual mode. Recoloring doesn't randomly replace the underlying pattern.

## Layers and regional controls

| Layer                 | Controls and interactions                                                                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Anatomy               | Body length/depth/bend, three forms, tail spread, fin reach, eye size. The same geometry defines rendering clips and the reaction domain.                                                                                      |
| Broad pigment         | Palette, dark-back/light-belly countershading, yellow pigment and spatial red patches.                                                                                                                                         |
| Dark markings         | Solid, longitudinal stripes, transverse bars, spots, reticulation, marbling, ocelli, or Gray–Scott reaction–diffusion. A second pattern can overlay the primary. Coverage, frequency, distortion and contrast remain separate. |
| Pale markings         | Independent bars/stripes/spots/rings, with their own strength, phase, scale and dark edging. These can interrupt dark markings; they aren't simply an inverted melanin layer.                                                  |
| Reflective appearance | Structural reflection, hue travel, reflection angle and white scattering. Dark pigment suppresses warm and reflective contributions through pigment competition. These are RGB illustration effects, not spectral optics.      |
| Surface               | Scale spacing/visibility, translucent fins, fin rays, pale fin margins, gill cover, eye and lateral line.                                                                                                                      |
| Brush and paper       | Actual p5.brush watercolor glaze, bleed, granulation and pencil contours, composited onto a seeded paper texture.                                                                                                              |

Nine regions have independent controls: **head, back, flank, belly, tail fin, dorsal fin, anal fin, pectoral fin and pelvic fin**. Each has a pattern override, pattern strength/frequency/phase, hue shift, dark and warm pigment amounts, reflective contribution, pale marking amount, shared-field influence and local reaction bias. Body regions blend smoothly; fins share coordinates at their attachment but can have their own pattern. Fin ray guidance distorts analytical fin patterns.

For example, select **Ringed fins**, set the head to bars, reduce belly pattern strength, and change the tail hue. Set a region's **Shared field influence** to zero for a fully local analytical pattern; one uses the shared primary/secondary mixture. A regional **Solid** override explicitly removes its dark markings. Regional frequency and phase affect analytical motifs; reaction–diffusion uses the shared physical field and local reaction bias instead.

**Fish surface → Layer view** displays the final painting, region map, dark pigment, warm contribution, reflection contribution or reaction field. These views help inspect overlapping layers. Viewing the reaction field computes it even when an analytical primary pattern is selected. The views retain anatomical details for orientation.

## Reaction–diffusion model

The implementation follows the Gray–Scott equations documented in the [research note](fish-coloration-research.md). Its numerical chemicals are a substrate `U` and autocatalyst `V`, not real pigment populations. The UI calls this family “Turing” as a familiar artistic category; Gray–Scott patterns need not arise from a classical linear Turing instability.

- A **180 × 150 screen-space grid** samples the connected fish silhouette, including fins. Overlapping pectoral tissue takes priority in the domain label map; this is a single visible-side model, not multiple skin surfaces.
- Masked outer edges use **zero flux**; there is no periodic wrap from head to tail or back to belly.
- Internal edges use equal and opposite transport, multiplied by **Boundary coupling** when adjoining labels differ. Zero isolates labeled regions for this numerical transport. Local reaction bias changes feed within a region, so one region can influence another through a genuine field interaction when coupling is enabled.
- A seeded perturbation distribution and a weak lateral organizer initialize growth. **Diffusion direction** changes horizontal/vertical transport weights. It does not rotate a finished texture.
- Four-neighbor diffusion, a timestep of `0.8`, bounded diffusion controls and double buffering keep the explicit update stable within the supported controls. Fields are clamped to `[0, 1]`; concentration-to-color uses a fixed range rather than normalizing every image separately.
- **Growth steps** controls numerical iterations, not biological age or simulated domain growth. Some feed/removal combinations extinguish the pattern or produce nearly uniform fields. The reaction view shows that outcome directly.
- Computation runs in a module worker. Superseded jobs terminate; stale results cannot replace the latest painting. A single cached field is reused for pigment-only edits. The cache key includes seed, anatomy, feed/removal, diffusion, iteration count, coupling, organizer and every local reaction bias.

The fixed grid is an interactive illustration tradeoff: very small markings can alias, and extreme feed/removal combinations are not guaranteed to be attractive. A regional reaction bias can affect neighboring tissue, while an analytical head hue edit leaves the tail untouched.

## p5.brush integration findings

The integration uses **p5.brush 3.0.0**, whose published package supports p5 2.2+ and an official standalone build. The existing application already uses p5 2.3.4. The [upstream README](https://github.com/acamposuribe/p5.brush/blob/main/README.md), [standalone guide](https://github.com/acamposuribe/p5.brush/blob/main/docs/standalone.md), and installed 3.0.0 source were checked during implementation.

The normal p5 build expects a WebGL2 target and lifecycle hooks. This application keeps its original 2D p5 canvas and uses **`p5.brush/standalone` in a detached WebGL2 canvas** as the material pass. It is the real library, with watercolor fills and a built-in `2H` pencil, not a replacement brush algorithm.

Brush positions use centered coordinates, so the adapter converts the application's top-left coordinates by subtracting 300. It explicitly loads, clears, seeds both random/noise streams, draws and calls `render()`. The brush compositor's white backing is combined with the pigment image using multiply and clipped to the anatomical silhouette. The brush canvas is reused between paintings; its WebGL context is released at application disposal. The library is loaded only when the final fish painting needs it. Diagnostic views work without this GPU pass.

The library ships no TypeScript declarations. `p5-brush.d.ts` declares only the public functions used by this adapter. WebGL2 is required for final fish brushwork. Exact brush pixels may vary between GPU/browser implementations even though recipe values, CPU fields and seeded streams are reproducible.

## Extension points

| Module                                          | Responsibility                                                                |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| `settings.ts`                                   | Typed region/schema definitions, defaults, bounded URL input; drives DialKit. |
| `recipes.ts`, `random.ts`                       | Named visual recipes and independent deterministic random streams.            |
| `geometry.ts`                                   | Shared anatomy, coordinates, region labels and clipping paths.                |
| `reaction.ts`, `reaction.worker.ts`, `field.ts` | Pure numerical solver, worker entry and cancellation.                         |
| `patterns.ts`                                   | Analytical motifs and shared/local field combinations.                        |
| `pigments.ts`                                   | Pigment, pale marking and reflective compositing; body-region blending.       |
| `surface.ts`                                    | Raster tissue painting, scales, rays and anatomical details.                  |
| `brush.ts`, `p5-brush.d.ts`                     | Public p5.brush adapter and its typed boundary.                               |
| `generator.ts`                                  | Ordered painting pipeline, field cache and resource lifetime.                 |

No fish rendering module depends on DialKit or DOM controls. The application coordinates subject selection and asynchronous results. The existing plant modules remain unchanged.
