import rawContent from "./data/content.json";

export type Project = { title: string; tagline: string; details: string };

export type Fact = { label: string; value: string };
export type Entry = { heading: string; meta: string; text: string };

export type AboutSection =
    | { title: string; tagline: string; type: "facts"; items: Fact[] }
    | { title: string; tagline: string; type: "entries"; items: Entry[] };

export type Content = {
    home: { title: string; paragraphs: string[] };
    projects: Project[];
    about: AboutSection[];
};

// content.json is the single source of truth for page text
export const content = rawContent as unknown as Content;
