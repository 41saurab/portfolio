import type { ReactNode } from "react";

type Props = {
    title: string;
    tagline: string;
    scrollable?: boolean;
    children: ReactNode;
};

/* One accordion card: title + tagline, details revealed on hover / focus */
export default function Card({ title, tagline, scrollable, children }: Props) {
    return (
        <article className="card" data-animate="card" tabIndex={0}>
            <div className="card-top">
                <div className="card-main">
                    <h2 className="card-title">{title}</h2>
                    <span className="card-tagline">{tagline}</span>
                </div>
                <span className="card-icon" aria-hidden="true" />
            </div>
            <div
                className="card-details"
                {...(scrollable ? { "data-lenis-prevent": "" } : {})}
            >
                {children}
            </div>
        </article>
    );
}
