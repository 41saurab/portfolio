import { Fragment } from "react";

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/* Plain text with optional [label](url) links.
   React escapes everything, so content.json can't inject markup. */
export default function RichText({ text }: { text: string }) {
    const parts: React.ReactNode[] = [];
    let last = 0;
    let key = 0;

    for (const m of text.matchAll(LINK)) {
        const index = m.index ?? 0;
        if (index > last) parts.push(text.slice(last, index));
        parts.push(
            <a
                key={key++}
                className="text-link"
                href={m[2]}
                target="_blank"
                rel="noopener noreferrer"
            >
                {m[1]}
            </a>
        );
        last = index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));

    return (
        <>
            {parts.map((part, i) => (
                <Fragment key={i}>{part}</Fragment>
            ))}
        </>
    );
}
