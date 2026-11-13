import { memo } from "react";
import { content } from "../types";
import RichText from "./RichText";

function Home() {
    const { title, paragraphs } = content.home;
    return (
        <main className="page" id="home">
            <div className="column">
                <h1 className="name" data-animate="name">
                    {title}
                </h1>
                {paragraphs.map((p) => (
                    <p key={p} className="intro" data-animate="text">
                        <RichText text={p} />
                    </p>
                ))}
            </div>
        </main>
    );
}

export default memo(Home);
