import { useRef } from "react";
import { useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Projects from "./components/Projects";
import About from "./components/About";
import NotFound from "./components/NotFound";
import { useSite } from "./hooks/useSite";
import config from "./data/config.json";

const paths = config.routes.map((r) => r.path);
const cleanPath = (p: string) => p.replace(/\/+$/, "") || "/";

/* The pinned, horizontally scrolling site (/, /projects, /about) */
function Site() {
    const root = useRef<HTMLDivElement>(null);
    const go = useSite(root);

    return (
        <div ref={root}>
            <div className="progress" aria-hidden="true" />
            <Header onNavigate={go} />

            {/* Pinned viewport: the track slides sideways as you scroll */}
            <div className="viewport">
                <div className="track">
                    <Home />
                    <Projects />
                    <About />
                </div>
            </div>

            <Footer onNavigate={go} />
        </div>
    );
}

export default function App() {
    const { pathname } = useLocation();

    // Any URL that isn't one of config.routes gets the 404 page.
    // Site unmounts and its GSAP / Lenis setup is cleaned up by useGSAP.
    return paths.includes(cleanPath(pathname)) ? <Site /> : <NotFound />;
}
