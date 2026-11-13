import { memo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import config from "../data/config.json";

const LABELS = ["Home", "Projects", "About"];

/* Shown for any URL that isn't in config.routes.
   Deliberately plain: no GSAP / Lenis, so it can't clash with the pinned site. */
function NotFound() {
    const { pathname } = useLocation();

    useEffect(() => {
        const previousTitle = document.title;
        document.title = "Page not found | Saurab Shrestha";

        // Netlify's SPA redirect answers 200 for every URL, so tell crawlers
        // not to index this page.
        const robots = document.createElement("meta");
        robots.name = "robots";
        robots.content = "noindex";
        document.head.appendChild(robots);

        return () => {
            document.title = previousTitle;
            robots.remove();
        };
    }, []);

    return (
        <>
            <header className="site-header">
                <Link to="/" className="brand">
                    Saurab Shrestha
                </Link>
            </header>

            <main className="not-found" id="not-found">
                <div className="column">
                    <p className="not-found-code" aria-hidden="true">
                        404
                    </p>
                    <h1 className="name">Page not found</h1>
                    <p className="intro">
                        There's nothing at{" "}
                        <code className="not-found-path">{pathname}</code>. It
                        may have moved, or the link might be mistyped.
                    </p>

                    <nav className="not-found-nav" aria-label="Pages">
                        {config.routes.map((route, i) => (
                            <Link key={route.path} to={route.path} className="link">
                                {LABELS[i] ?? route.path}
                            </Link>
                        ))}
                    </nav>
                </div>
            </main>
        </>
    );
}

export default memo(NotFound);
