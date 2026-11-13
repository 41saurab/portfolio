import { memo } from "react";
import { content } from "../types";
import Card from "./Card";
import RichText from "./RichText";

function Projects() {
    return (
        <section className="page" id="projects" aria-label="Projects">
            <div className="column column--fill">
                <div className="projects">
                    {content.projects.map((p) => (
                        <Card key={p.title} title={p.title} tagline={p.tagline}>
                            <p>
                                <RichText text={p.details} />
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default memo(Projects);
