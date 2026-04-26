import mp from "@/assets/project-mp.jpg";
import dholera from "@/assets/project-dholera.jpg";
import bhopal from "@/assets/project-bhopal.jpg";
import { MapPin } from "lucide-react";

const projects = [
  { img: mp, name: "Wavelength Residency MP", location: "Indore, Madhya Pradesh", status: "Active", scope: "G+12 Residential Tower · 84 units" },
  { img: dholera, name: "Dholera Smart City Block A", location: "Dholera SIR, Gujarat", status: "Active", scope: "Township civil works · 18 acres" },
  { img: bhopal, name: "Bhopal Commercial Tower", location: "Bhopal, Madhya Pradesh", status: "Planning", scope: "G+8 Commercial · 1.2 lakh sqft" },
];

export const ProjectsSection = () => {
  return (
    <section id="projects" className="py-24 lg:py-32 relative bg-card/30">
      <div className="container">
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            <span className="size-1.5 rounded-full bg-primary" /> Active projects
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Sites we're <span className="text-gradient-primary">running right now.</span>
          </h2>
          <p className="text-lg text-muted-foreground">A live snapshot of work in MP and Dholera.</p>
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
