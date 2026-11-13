import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import config from "../data/config.json";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const { scroll, routes } = config;
const paths = routes.map((r) => r.path);
const titles = routes.map((r) => r.title);
const last = paths.length - 1;

const cleanPath = (p: string) => p.replace(/\/+$/, "") || "/";
const indexFromPath = (p: string) => Math.max(0, paths.indexOf(cleanPath(p)));

/* Drives the whole site:
   - pinned horizontal pages (ScrollTrigger + Lenis)
   - entrance animations (SplitText + GSAP)
   - URL <-> page sync (/, /projects, /about)
   Returns go(i), which navigates to page i. */
export function useSite(root: RefObject<HTMLDivElement | null>) {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    // Latest values for use inside GSAP callbacks (which are created once)
    const pathRef = useRef(pathname);
    pathRef.current = pathname;
    const navRef = useRef(navigate);
    navRef.current = navigate;

    const current = useRef(0); // page currently in view
    const navigating = useRef(false); // true while a link / key animation runs
    const goTo = useRef<(i: number) => void>(() => {});

    // Links and keys only change the URL; the effect below does the scrolling
    const go = useCallback((i: number) => {
        const target = Math.min(Math.max(i, 0), last);
        if (paths[target] !== cleanPath(pathRef.current)) {
            navRef.current(paths[target]);
        } else {
            goTo.current(target);
        }
    }, []);

    // URL changed (link, back / forward) -> bring that page into view.
    // When scrolling changed the URL, current already matches, so this is a no-op.
    useEffect(() => {
        const i = indexFromPath(pathname);
        if (i !== current.current) goTo.current(i);
    }, [pathname]);

    // Left / right arrow keys switch pages
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") go(current.current + 1);
            if (e.key === "ArrowLeft") go(current.current - 1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [go]);

    useGSAP(
        () => {
            const el = root.current;
            if (!el) return;

            const q = <T extends Element>(selector: string) =>
                gsap.utils.toArray<T>(selector, el);

            const viewport = el.querySelector<HTMLElement>(".viewport")!;
            const track = el.querySelector<HTMLElement>(".track")!;
            const pages = q<HTMLElement>(".page");
            const navLinks = q<HTMLElement>("[data-goto]");
            const headerItems = q<HTMLElement>('[data-animate="header"]');
            const iconItems = q<HTMLElement>('[data-animate="icon"]');
            const footerItems = q<HTMLElement>('[data-animate="footer"]');
            const footerRule = el.querySelector<HTMLElement>(".footer-rule");
            const progress = el.querySelector<HTMLElement>(".progress");

            const startIndex = indexFromPath(pathRef.current);

            function setActive(i: number) {
                current.current = i;
                document.title = titles[i];

                // Active footer link. Toggled on the DOM, not through React,
                // so React never re-renders text that SplitText has split.
                navLinks.forEach((link) => {
                    const on =
                        Number(link.dataset.goto) === i &&
                        link.classList.contains("link");
                    link.classList.toggle("is-active", on);
                    if (on) link.setAttribute("aria-current", "page");
                    else link.removeAttribute("aria-current");
                });

                // Keep the address bar in step with the page in view
                if (!navigating.current && cleanPath(pathRef.current) !== paths[i]) {
                    navRef.current(paths[i], { replace: true });
                }
            }

            /* Reusable SplitText line reveal.
               scrollTrigger is only passed for pages that start off-screen. */
            function revealLines(
                target: HTMLElement,
                {
                    delay = 0,
                    scrollTrigger,
                }: { delay?: number; scrollTrigger?: ScrollTrigger.Vars } = {}
            ) {
                SplitText.create(target, {
                    type: "lines",
                    mask: "lines",
                    autoSplit: true, // re-splits on resize and when fonts load
                    onSplit(self) {
                        gsap.set(target, { autoAlpha: 1 }); // un-hide (CSS hid it)
                        // Returning the tween lets SplitText revert and re-run it
                        return gsap.from(self.lines, {
                            yPercent: 110,
                            duration: 0.9,
                            stagger: 0.1,
                            ease: "power3.out",
                            delay,
                            scrollTrigger,
                        });
                    },
                });
            }

            // Everything lives inside matchMedia, so GSAP reverts all tweens,
            // splits and ScrollTriggers if the reduced-motion preference changes.
            const mm = gsap.matchMedia();

            mm.add("(prefers-reduced-motion: no-preference)", () => {
                /* ---------- Lenis smooth scroll, driven by the GSAP ticker ---------- */
                const lenis = new Lenis({
                    lerp: scroll.lerp,
                    wheelMultiplier: scroll.wheelMultiplier,
                    gestureOrientation: "both", // trackpad sideways swipes work too
                });
                lenis.on("scroll", ScrollTrigger.update);
                const tick = (time: number) => lenis.raf(time * 1000);
                gsap.ticker.add(tick);
                gsap.ticker.lagSmoothing(0);

                /* ---------- HORIZONTAL PAGES: pinned, scrubbed ScrollTrigger ----------
                   Vertical wheel / swipe is converted into sideways movement of
                   the track. The viewport is pinned, so the page never visibly
                   scrolls down. */
                const scrollTween = gsap.to(track, {
                    xPercent: (-100 * last) / pages.length,
                    ease: "none", // scrub maps 1:1 to scroll
                    scrollTrigger: {
                        trigger: viewport,
                        pin: true,
                        scrub: true,
                        start: "top top",
                        end: () => "+=" + window.innerWidth * scroll.perPage * last,
                        invalidateOnRefresh: true,
                        snap: {
                            snapTo: 1 / last, // lands exactly on a page
                            duration: { min: scroll.snapMin, max: scroll.snapMax },
                            delay: scroll.snapDelay,
                            ease: "power2.inOut",
                        },
                        onUpdate: (self) =>
                            setActive(Math.round(self.progress * last)),
                    },
                });

                const pageOffset = (i: number) => {
                    const st = scrollTween.scrollTrigger!;
                    return st.start + ((st.end - st.start) * i) / last;
                };

                goTo.current = (i) => {
                    navigating.current = true;
                    lenis.scrollTo(pageOffset(i), {
                        duration: scroll.gotoDuration,
                        easing: (t: number) => 1 - Math.pow(1 - t, 4),
                        onComplete: () => {
                            navigating.current = false;
                            setActive(i);
                        },
                    });
                };

                // Opening /projects or /about directly: start on that page
                if (startIndex > 0) {
                    ScrollTrigger.refresh();
                    lenis.scrollTo(pageOffset(startIndex), { immediate: true });
                }
                setActive(startIndex);

                /* ---------- HEADER ---------- */
                headerItems.forEach((item, i) => {
                    revealLines(item, { delay: 0.1 + i * 0.1 });
                });

                gsap.fromTo(
                    iconItems,
                    { autoAlpha: 0, y: -12 },
                    {
                        autoAlpha: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.1,
                        delay: 0.2,
                        ease: "power3.out",
                        clearProps: "transform",
                    }
                );

                /* ---------- PAGE CONTENT ----------
                   Page 1 plays on load. Pages 2 and 3 play once, the first time
                   they slide into view (ScrollTrigger tied to the horizontal
                   tween via containerAnimation). */
                pages.forEach((page, i) => {
                    const first = i === 0;
                    const scrollTrigger: ScrollTrigger.Vars | undefined = first
                        ? undefined
                        : {
                              trigger: page,
                              containerAnimation: scrollTween,
                              start: "left 75%",
                              once: true,
                          };

                    // Title: SplitText chars
                    const title = page.querySelector<HTMLElement>(
                        '[data-animate="name"]'
                    );
                    if (title) {
                        SplitText.create(title, {
                            type: "words, chars", // words keep the title from breaking mid-word
                            mask: "chars",
                            autoSplit: true,
                            onSplit(self) {
                                gsap.set(title, { autoAlpha: 1 });
                                return gsap.from(self.chars, {
                                    yPercent: 110,
                                    duration: 1,
                                    stagger: 0.04,
                                    ease: "power3.out",
                                    delay: first ? 0.2 : 0,
                                    scrollTrigger,
                                });
                            },
                        });
                    }

                    // Paragraphs: SplitText lines
                    page
                        .querySelectorAll<HTMLElement>('[data-animate="text"]')
                        .forEach((p, k) => {
                            revealLines(p, {
                                delay: first ? 0.8 + k * 0.25 : 0.25 + k * 0.15,
                                scrollTrigger,
                            });
                        });

                    // Cards: staggered fade up
                    const cards = page.querySelectorAll('[data-animate="card"]');
                    if (cards.length) {
                        gsap.fromTo(
                            cards,
                            { autoAlpha: 0, y: 32 },
                            {
                                autoAlpha: 1,
                                y: 0,
                                duration: 0.9,
                                stagger: 0.12,
                                ease: "power3.out",
                                delay: first ? 1.1 : 0.3,
                                clearProps: "transform", // leave no inline transform behind
                                scrollTrigger,
                            }
                        );
                    }
                });

                /* ---------- FOOTER ---------- */
                if (footerRule) {
                    gsap.fromTo(
                        footerRule,
                        { scaleX: 0 },
                        { scaleX: 1, duration: 1.2, delay: 0.6, ease: "power3.inOut" }
                    );
                }

                footerItems.forEach((item, i) => {
                    revealLines(item, { delay: 1 + i * 0.1 });
                });

                /* ---------- PROGRESS BAR ---------- */
                if (progress) {
                    gsap.to(progress, {
                        scaleX: 1,
                        ease: "none",
                        scrollTrigger: { start: 0, end: "max", scrub: true },
                    });
                }

                return () => {
                    gsap.ticker.remove(tick);
                    lenis.destroy();
                    goTo.current = () => {};
                    navigating.current = false;
                };
            });

            // Reduced motion: the CSS stacks the pages vertically and hides
            // nothing. Routes still work for links, back / forward, direct visits.
            mm.add("(prefers-reduced-motion: reduce)", () => {
                goTo.current = (i) => {
                    current.current = i;
                    document.title = titles[i];
                    pages[i]?.scrollIntoView();
                };
                current.current = startIndex;
                document.title = titles[startIndex];
                if (startIndex > 0) pages[startIndex]?.scrollIntoView();
            });

            return () => mm.revert();
        },
        { scope: root }
    );

    return go;
}
