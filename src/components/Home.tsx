import {
  CodeIcon,
  LayersIcon,
  CubeIcon,
  LightningBoltIcon,
  ArrowRightIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import { href, type PageWithContent } from "../lib/content";
const tracks = [
  {
    slug: "backend",
    title: "Backend engineering",
    description: "Follow requests. Shape APIs. Make the right trade-offs.",
    icon: CodeIcon,
    start: "backend",
  },
  {
    slug: "system-design",
    title: "System design",
    description: "Understand how systems scale, and where they break.",
    icon: LayersIcon,
    start: "system-design",
  },
  {
    slug: "agentic-ai",
    title: "Agentic AI",
    description: "Build a clear model of agents, retrieval, and tools.",
    icon: CubeIcon,
    start: "agentic-ai",
  },
  {
    slug: "java-spring",
    title: "Java & Spring",
    description: "Connect the framework to what happens in production.",
    icon: LightningBoltIcon,
    start: "java-spring",
  },
];
export function Home({ page }: { page: PageWithContent }) {
  return (
    <main id="main" className="home">
      <div className="home-hero">
        <p className="eyebrow">The developer's field guide</p>
        <h1>
          Understand the system.
          <br />
          Build with confidence.
        </h1>
        <p className="hero-description">
          Practical explanations of the software you build.
          <br className="desktop-break" /> Follow the mechanics, connect the
          ideas, and find your next question.
        </p>
        <div className="hero-actions">
          <a
            className="button-primary"
            href={href(page.base, "guides/request-lifecycle")}
          >
            Start with a single request <ArrowRightIcon />
          </a>
          <a className="text-link" href="#explore">
            Explore the handbook <ChevronDownIcon />
          </a>
        </div>
      </div>
      <section id="explore" className="explore-section">
        <div className="section-heading">
          <h2>Where do you want to go?</h2>
          <p>{page.count} guides. Pick a topic and follow your curiosity.</p>
        </div>
        <div className="track-grid">
          {tracks.map((track, index) => (
            <a
              key={track.slug}
              className={`track track-${index}`}
              href={href(page.base, track.start)}
            >
              <div className="track-top">
                <track.icon />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{track.title}</h3>
              <p>{track.description}</p>
              <span className="track-link">
                Explore this topic <ArrowRightIcon />
              </span>
            </a>
          ))}
        </div>
      </section>
      <section className="start-section">
        <div>
          <span className="small-label">A good place to begin</span>
          <h2>
            One request.
            <br />
            The whole picture.
          </h2>
          <p>
            Trace a request from the browser to the database and back. Meet the
            parts of a backend in the order they actually do their work.
          </p>
          <a
            className="text-link"
            href={href(page.base, "guides/request-lifecycle")}
          >
            Follow the request <ArrowRightIcon />
          </a>
        </div>
        <ol className="request-map">
          {["Browser", "Edge & routing", "Application", "Database"].map(
            (label, index) => (
              <li key={label}>
                <span className="request-number">{index + 1}</span>
                <div>
                  <strong>{label}</strong>
                  <span>
                    {
                      [
                        "Send the request",
                        "Find the destination",
                        "Make the decision",
                        "Read and write the data",
                      ][index]
                    }
                  </span>
                </div>
                {index !== 3 && <ArrowRightIcon className="request-arrow" />}
              </li>
            ),
          )}
        </ol>
      </section>
      <section className="quick-links">
        <a href={href(page.base, "system-design/walkthroughs")}>
          <span>Put the ideas to work</span>
          <h3>
            Design walkthroughs <ArrowRightIcon />
          </h3>
          <p>Feeds, crawlers, caches, and the decisions behind them.</p>
        </a>
        <a href={href(page.base, "reference/system-design-glossary")}>
          <span>Keep the details close</span>
          <h3>
            The reference shelf <ArrowRightIcon />
          </h3>
          <p>Terms, status codes, database indexes, and useful resources.</p>
        </a>
      </section>
      <footer className="home-footer">
        <span>Dev Handbook</span>
        <span>Free to read. Open to everyone.</span>
      </footer>
    </main>
  );
}
