# Fish coloration and a layered generative model

Research date: 28 October 2026. This note separates experimental findings, mathematical models, and proposed artistic approximations. It supplies a basis for a browser illustration tool, not a validated simulation of any fish species.

## What makes a fish look colored

A useful model separates **where pigment cells occur**, **what they absorb or reflect**, and **how light reaches and leaves the skin**. One procedural texture cannot represent all three. Different species and different anatomical regions need not have the same cells or the same organization.

| Component     | Evidence and visual role                                                                                                                                             | Proposed illustration control                                                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Melanophores  | Dark melanin-bearing cells participate in zebrafish dark stripes. Their distribution depends on other cell populations [1].                                          | Dark pigment amount, darkness, coverage and pattern contrast.                                                                            |
| Xanthophores  | Yellow/orange cells participate in light interstripes [1]. Experiments identify the pteridine sepiapterin as a source of yellow coloration in embryos [2].           | Yellow/gold pigment amount and hue; complementary occupancy to dark markings.                                                            |
| Erythrophores | Red cells in pearl danio fins share early progenitors with xanthophores, with outcomes depending on position; carotenoid-processing genes affect red coloration [3]. | Red/orange pigment amount, patch extent and regional bias.                                                                               |
| Iridophores   | Guanine crystal arrays create structural color. A zebrafish study measured coordinated crystal tilting during induced color change [4].                              | Reflective amount, sheen hue, light/view angle and directional highlights. These are display approximations rather than spectral optics. |
| Leucophores   | White fish cells are diverse. Danio has distinct orange/white and white cell classes, often restricted to particular fin regions [5].                                | Pale coverage and fin-edge whiteness, separate from metallic sheen.                                                                      |

Do not interpret these controls as literal cell counts. Rendered opacity is an artistic contribution. A selected blue color is not evidence of blue pigment: structural reflection can produce blue appearance [4]. Nor should a renderer assume that every species shares a universal fixed stack of pigment layers; the proposed paint order is an image-compositing choice.

## Pattern formation: interaction, anatomy and development

**Zebrafish provide strong evidence for interacting cell populations.** Removing iridophores reduces melanophore abundance and breaks normal trunk stripes. The first light stripe appears at the horizontal myoseptum, providing an anatomical cue; interactions then help organize subsequent stripes. Iridophores support melanophores and associate with xanthophores, while short-range exclusion helps separate populations [1]. This supports a shared pattern field and a tunable anatomical organizer rather than independently pasted stripes.

An agent-based study reproduces aspects of stripe development using cell interactions and domain growth, with iridophores assisting alignment [6]. A separate mathematical study demonstrates a Turing bifurcation in a model without cell movement [7]. **Turing-like organization does not imply that fish skin contains two freely diffusing chemicals matching a graphics algorithm.** Cell birth, survival, contact, long protrusions and growth can produce comparable spatial dynamics.

**Fins should connect to the body without being copies of it.** Tailfin modeling finds that two pigment populations can produce stripes and explores the effects of rays, growth and the body–fin interface [8]. This is an exploratory modeling result, not proof that one universal mechanism patterns every fin. Use an inherited body signal at the attachment and a separately adjustable local fin field. A coupling slider can blend their phase/contrast continuously; zero coupling should allow independent patterns.

**White bars are another biological route.** Clownfish experiments identify iridophore contributions to white barring [9]. Hormonal experiments alter the timing and appearance of these bars [10]. A white transverse bar therefore should be an independent pale-region mask with a dark border option, not merely a negative black stripe.

**Localized ornaments need their own masks.** Cichlid anal-fin egg-spots contain xanthophores, iridophores and scattered melanophores; genetic and reporter experiments implicate regulatory changes associated with their emergence [11]. A ring can therefore combine a warm center, pale reflective halo and darker boundary, while still taking color and intensity from the shared pigment controls. Egg-spots and body eyespots are not interchangeable biological structures.

An original comparative butterflyfish study found both spots and eyespots evolutionarily variable and cautioned against simple universal explanations of their function [12]. Offer ocelli as a visual motif with position, radius, ring width and regional placement. Do not claim the generated motifs deter predators or reproduce a demonstrated developmental pathway.

**Dorsal–ventral appearance is a separate broad field.** An aquatic countershading experiment found environmental adjustment of fish reflectance but did not support a simple optimal self-shadow-cancellation explanation [13]. A dark-back/light-belly gradient is useful, but its exact shape and strength should be user controls. It should multiply broad pigmentation and lighting, leaving smaller markings legible.

**Growth matters.** Observations of marine angelfish show stripes rearranging during growth instead of merely enlarging, and reaction–diffusion simulations predict aspects of this rearrangement [14]. A static generator can expose scale and simulation maturity; it should not label a texture rescale as simulated biological growth.

## Turing patterns and an implementable reaction–diffusion layer

Turing's original work describes how reaction and transport can destabilize uniform states and generate spatial organization [15]. Pearson's Gray–Scott simulations show a range of spots and irregular structures following finite-amplitude perturbations [16]. Gray–Scott is a useful artistic mechanism, but its patterns are not all classical linear Turing instabilities, and its chemicals do not map directly to fish chromatophore classes.

A conventional nondimensional form is:

```text
∂u/∂t = Du ∇²u − u v² + F (1 − u)
∂v/∂t = Dv ∇²v + u v² − (F + k) v
```

Here `u` and `v` are numerical fields; `F` replenishes `u` and `k` helps remove `v`. They must not be described as measured melanin and yellow pigment concentrations. Diffusion ratio, feed, removal, initialization, geometry, elapsed iterations and discretization all affect the result. For finite-amplitude patterns, a uniform unperturbed field may remain uniform [16].

Recommended implementation choices below are **engineering proposals**, not claims from the biological papers:

- Initialize fields from a deterministic seed with several spatial perturbations. Preserve reproducibility when recoloring an existing pattern.
- Use double-buffered typed arrays so an iteration reads a single complete previous state. Bound the explicit timestep according to the implemented stencil and diffusion coefficients, constrain controls to stable ranges, and reject non-finite imported inputs.
- Give domain boundaries an explicit meaning. For a masked fish domain, a zero-flux edge can use the center value for a missing neighbor. A rectangular field sampled onto the fish instead is a texture-domain simulation; document it as such. Periodic wrapping joins opposite edges and is not automatically appropriate to a head and tail.
- State whether computation happens on skin coordinates or screen coordinates. A normalized longitudinal/transverse body chart preserves markings as body depth changes; fin rays need their own chart.
- Anisotropic transport or oriented initialization can bias stripe direction. It should be clear whether an orientation slider changes the solver or rotates sampling afterward.
- Threshold `v` through a smooth transition to produce coverage; use a narrow band around a contour for a pale or dark outline. This creates connected pigment boundaries, rather than separately randomized outlines.
- Keep diffusion controls independent of final display opacity. A user should be able to recolor the same spatial field without creating another pattern.
- Provide curated parameter recipes with meaningful variation. Unrestricted feed/removal combinations can legitimately settle to a blank or uniform field; that must not be presented as a renderer crash.

## Proposed system of regions and interacting layers

This is an implementation plan derived from the research, **not a universal anatomical model**.

1. **Geometry and region coordinates:** define body, head/operculum, dorsal, ventral belly, tail peduncle, caudal fin, dorsal fin, anal fin and pectoral fin. Share precise attachment coordinates between geometry and color masks. Use smooth overlaps for pigment transitions, while retaining crisp anatomical outlines.
2. **Broad pigmentation:** establish body ground color, dorsal darkness, pale belly and optional head tint. Region weights should sum predictably so overlapping masks do not accidentally amplify opacity.
3. **Shared organization:** generate a seeded low-frequency field and an optional reaction–diffusion field. Both are sampled continuously along the body. A lateral organizer can bias orientation and provide a positional reference.
4. **Regional pattern layers:** combine stripes, transverse bars, spots, reticulation/labyrinths, blotches, ocelli and pale bars as separately controllable masks. Allow combinations: a spotted flank over a broad stripe, a pale belly interrupting markings, an eye mask continuing a head bar, or a tail ornament inherited from a body motif.
5. **Coupling:** use explicit parameters for body-to-fin inheritance, head-to-body continuity, boundary softness, pigment exclusion and reflective response to pigment coverage. Coupling must affect actual fields or compositing weights, not merely use the same random seed.
6. **Reflective layer:** derive sheen from a light direction and coarse surface orientation; suppress or alter it using dark-pigment coverage. Retain an independent pale diffuse layer so a white bar differs from a blue metallic highlight.
7. **Fine anatomy:** scales, fin rays, gill boundary, eye and contours. Sample the underlying regional color when placing scale detail, so scales articulate the pattern instead of obscuring it. Avoid applying body scales over fins.
8. **Painterly rendering:** lay broad washes beneath pigment textures, then restrained fine brush contours and ray strokes. Watercolor bleed may cross a pigment border artistically, but clipping should prevent unexplained marks beyond the fish silhouette.

A region should expose at least pigment/tint, marking coverage, contrast and inheritance/phase or orientation where relevant. Shared base parameters plus regional overrides are easier to reason about than unrelated random generators. Seed mode should sample a coherent recipe; manual mode should expose the same resolved settings. Share URLs should serialize those settings rather than depend on transient canvas state.

## Verification implications

- Fixed seed and settings must reproduce geometry and pattern fields. If the GPU brush pass is not pixel-identical across platforms, test numerical fields separately and disclose that limit.
- Changing a pigment hue should preserve pattern geometry; changing diffusion should change organization; changing coupling should alter the connected regions; changing a head-only control should leave unrelated fin geometry intact.
- Test the smallest and largest supported domains, zero pigment/zero coupling, maximum iterations, and malformed URL values. Check all field entries remain finite and stable.
- Inspect multiple recipes: countershaded silver, longitudinal stripes, transverse pale bars, spots, reticulation, warm patches and localized rings. These should differ structurally, not just in palette.
- A single screenshot is insufficient to establish coverage. Verify manual controls, URL round trips, downloads, switching back to seed mode, and both flower and fish rendering if the existing flower generator remains available.

## Primary sources

1. Frohnhöfer et al. (2013), **Iridophores and their interactions with other chromatophores are required for stripe formation in zebrafish**. Experimental mutant/chimera evidence. [Development / full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC3912879/).
2. Le Guyader and Jesuthasan (2002), **Analysis of xanthophore and pterinosome biogenesis in zebrafish using methylene blue and pteridine autofluorescence**. [PubMed](https://pubmed.ncbi.nlm.nih.gov/11837453/).
3. Huang et al. (2021), **Development and genetics of red coloration in the zebrafish relative Danio albolineatus**. [eLife](https://elifesciences.org/articles/70253).
4. Gur et al. (2024), **The physical and cellular mechanism of structural color change in zebrafish**. [PNAS / PubMed](https://pubmed.ncbi.nlm.nih.gov/38805288/), [full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC11161791/).
5. Lewis et al. (2019), **Fate plasticity and reprogramming in genetically distinct populations of Danio leucophores**. [PNAS](https://doi.org/10.1073/pnas.1901021116).
6. Volkening and Sandstede (2015), **Modelling stripe formation in zebrafish: an agent-based approach**. [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC4685853/).
7. Bullara and De Decker (2015), **Pigment cell movement is not required for generation of Turing patterns in zebrafish skin**. A mathematical model. [Nature Communications](https://www.nature.com/articles/ncomms7971).
8. Volkening et al. (2020), **Modeling Stripe Formation on Growing Zebrafish Tailfins**. Exploratory agent-based modeling. [Published abstract](https://pubmed.ncbi.nlm.nih.gov/32356149/), [author preprint](https://arxiv.org/abs/1911.03758).
9. Salis et al. (2018), **Ontogenetic and phylogenetic simplification during white stripe evolution in clownfishes**. [PubMed](https://pubmed.ncbi.nlm.nih.gov/30180844/).
10. Salis et al. (2021), **Thyroid hormones regulate the formation and environmental plasticity of white bars in clownfishes**. [Full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC8201804/).
11. Santos et al. (2014), **The evolution of cichlid fish egg-spots is linked with a cis-regulatory change**. [Nature Communications](https://www.nature.com/articles/ncomms6149).
12. Kelley et al. (2013), **Spots and stripes: ecology and colour pattern evolution in butterflyfishes**. [PubMed](https://pubmed.ncbi.nlm.nih.gov/23427170/).
13. **Aquatic prey use countershading camouflage to match the visual background** (2017). Controlled fish reflectance/background experiment. [Behavioral Ecology](https://academic.oup.com/beheco/article-abstract/28/5/1314/3943833).
14. Kondo and Asai (1995), **A reaction–diffusion wave on the skin of the marine angelfish Pomacanthus**. [PubMed abstract](https://pubmed.ncbi.nlm.nih.gov/24547605/).
15. Turing (1952), **The chemical basis of morphogenesis**. [Original paper DOI](https://doi.org/10.1098/rstb.1952.0012), [paper scan](https://groups.csail.mit.edu/mac/projects/amorphous/6.978/papers/turing-chemical-basis.pdf).
16. Pearson (1993), **Complex Patterns in a Simple System**. Original Gray–Scott numerical-pattern study. [Author preprint](https://arxiv.org/abs/patt-sol/9304003).
