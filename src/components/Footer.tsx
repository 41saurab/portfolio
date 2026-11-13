import { memo } from "react";
import config from "../data/config.json";

type Props = { onNavigate: (i: number) => void };

const LABELS = ["Home", "Projects", "About"];

function Footer({ onNavigate }: Props) {
    return (
        <footer className="site-footer">
            <div className="footer-inner">
                <span className="footer-rule" aria-hidden="true" />

                <nav className="footer-nav" aria-label="Pages">
                    {config.routes.map((route, i) => (
                        <a
                            key={route.path}
                            className="link"
                            data-animate="footer"
                            data-goto={i}
                            href={route.path}
                            onClick={(e) => {
                                if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                                e.preventDefault();
                                onNavigate(i);
                            }}
                        >
                            {LABELS[i] ?? route.path}
                        </a>
                    ))}
                </nav>
            </div>
        </footer>
    );
}

export default memo(Footer);
