import mp from "@/assets/project-mp.jpg";
import dholera from "@/assets/project-dholera.jpg";
import bhopal from "@/assets/project-bhopal.jpg";
import { MapPin } from "lucide-react";

const projects = [
  { img: mp, name: "\n", location: "\n", status: "Active", scope: "\n" },
  { img: dholera, name: "\n", location: "\n", status: "Active", scope: "\n" },
  { img: bhopal, name: "\n", location: "\n", status: "Planning", scope: "\n" },
];

export const ProjectsSection = () => {
  return (
    <section id="projects" className="py-24 lg:py-32 relative bg-card/30">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            <span className="size-1.5 rounded-full bg-primary" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            {"\n"}
          </h2>
          <p className="text-lg text-muted-foreground">{"\n"}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <article key={p.name} className="group surface-card rounded-2xl overflow-hidden hover:border-primary/40 transition-all duration-500 hover:-translate-y-1">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={p.img} alt={p.name} loading="lazy" width={1024} height={768} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono uppercase ${p.status === "Active" ? "text-[hsl(var(--success))]" : "text-secondary"}`}>● {p.status}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                  <MapPin className="size-3.5" /> {p.location}
                </div>
                <p className="text-sm text-foreground/70">{p.scope}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
