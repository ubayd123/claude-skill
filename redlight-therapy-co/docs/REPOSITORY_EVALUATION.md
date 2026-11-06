# Evaluation of the six supplied repositories

All six repositories were cloned and inspected before choosing the stack.

| Repository | What it is | Licence | Verdict |
|---|---|---|---|
| **GSAP** (v3.15.1) | The GreenSock animation platform, incl. ScrollTrigger | GreenSock standard "no charge" licence (free for commercial sites) | **Used: core animation engine.** Best animations and best performance of the six. Timelines, ScrollTrigger pinning/scrubbing, `matchMedia` for mobile variants, `quickTo` for pointer effects. Installed from npm at the same version. |
| **Lenis** (v1.3.27) | Smooth-scroll library by darkroom.engineering | MIT | **Used: smooth scrolling.** Tiny, actively maintained, integrates cleanly with the GSAP ticker; disabled automatically for reduced-motion users. |
| **React Bits** | 130+ animated React components (TS + Tailwind variants) | MIT + Commons Clause (use in a website is allowed; redistributing the components themselves is not) | **Used selectively: best reusable components.** `SpotlightCard`, `Magnet` and `ScrollVelocity` were studied and re-implemented in a lighter form (`SpotlightCard.tsx`, `Magnetic.tsx`, `Marquee.tsx`) on top of GSAP, with attribution. Heavier WebGL backgrounds were not used, to protect mobile performance. |
| **MotionSites claude-skill** | A Claude skill with design "taste rules", technique recipes and a screenshot review loop | MIT (instructions); examples/media © MotionSites | **Used as design guidance: best overall design thinking.** Its rules on type scale, entrance choreography, reduced-motion fallbacks, no white flash and mobile overflow guards shaped the design system. Its example prompts and stock media were *not* used: the site uses your own product photography. |
| **HyperFrames** | HeyGen's HTML-to-video rendering framework (Puppeteer + FFmpeg) | Apache-2.0 | **Not used at runtime: best technical architecture, wrong job.** It renders videos offline, not websites. It's a good fit later for producing product promo videos from your photos to drop into the site's video slots. |
| **ClaudeAnimationBase** | A p5.brush character kit for painting animations of a mascot | MIT | **Not used.** Hand-painted character animation; unrelated to a product catalogue and it would add a heavy canvas library. |

## Summary of the six comparison questions
1. **Best overall design:** MotionSites skill (design rules); React Bits for component polish.
2. **Best animations:** GSAP.
3. **Best reusable components:** React Bits.
4. **Best technical architecture:** HyperFrames (monorepo, tests, docs), though it targets video, not web.
5. **Best performance:** GSAP + Lenis (small, GPU-friendly, no WebGL needed).
6. **Most useful functionality:** GSAP ScrollTrigger (pinning, scrubbing, horizontal sections).

## Technologies considered and left out
- **Framer Motion:** would duplicate GSAP; one animation engine keeps the bundle small and timing consistent.
- **Three.js:** no 3D product models were supplied, and a 3D scene of invented geometry would misrepresent the products. The animated logo rings and GSAP layering give depth without it. If you supply 3D/360° product assets, a viewer can be added to product pages.
- **Shopify / any checkout or payment SDK:** excluded by the brief.
