import { memo } from "react";
import { content } from "../types";
import Card from "./Card";
import RichText from "./RichText";

function About() {
    return (
        <section className="page" id="about" aria-label="About">
            <div className="column column--fill">
                <div className="projects projects--fill">
                    {content.about.map((section) => (
                        <Card
                            key={section.title}
                            title={section.title}
                            tagline={section.tagline}
                            scrollable
                        >
                            {section.type === "facts" ? (
                                <dl className="card-body facts">
                                    {section.items.map((item) => (
                                        <FactRow key={item.label} {...item} />
                                    ))}
                                </dl>
                            ) : (
                                <div className="card-body">
                                    {section.items.map((item) => (
                                        <div className="entry" key={item.heading}>
                                            <div className="entry-head">
                                                <strong>{item.heading}</strong>
                                                <span>{item.meta}</span>
                                            </div>
                                            <p>
                                                <RichText text={item.text} />
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FactRow({ label, value }: { label: string; value: string }) {
    return (
        <>
            <dt>{label}</dt>
            <dd>
                <RichText text={value} />
            </dd>
        </>
    );
}

export default memo(About);
