import { Facebook, Instagram } from "lucide-react";

// NOTE: Replace these handles/URLs with your real Page URL and post URL anytime.
const FACEBOOK_PAGE_URL = "https://www.facebook.com/wavelengthinfratech";
const INSTAGRAM_POST_URL = "https://www.instagram.com/wavelengthinfratech/";

const fbSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
  FACEBOOK_PAGE_URL
)}&tabs=timeline&width=500&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;

const igSrc = `${INSTAGRAM_POST_URL.replace(/\/?$/, "/")}embed`;

export const SocialSection = () => {
  return (
    <section id="social" className="py-24 lg:py-32 relative">
      <div className="container">
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
            <span className="size-1.5 rounded-full bg-primary" /> Live from our handles
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Follow our <span className="text-gradient-primary">build journey.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Daily progress, site reels and design drops — straight from Wavelength Infratech.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <article className="surface-card rounded-2xl overflow-hidden">
            <header className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Facebook className="size-4 text-primary" />
                <span className="text-sm font-semibold">Facebook</span>
              </div>
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono uppercase text-muted-foreground hover:text-primary"
              >
                Open page →
              </a>
            </header>
            <div className="bg-card">
              <iframe
                src={fbSrc}
                title="Wavelength Infratech on Facebook"
                width="100%"
                height="600"
                style={{ border: "none", overflow: "hidden", display: "block" }}
                scrolling="no"
                frameBorder={0}
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                loading="lazy"
              />
            </div>
          </article>

          <article className="surface-card rounded-2xl overflow-hidden">
            <header className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Instagram className="size-4 text-primary" />
                <span className="text-sm font-semibold">Instagram</span>
              </div>
              <a
                href={INSTAGRAM_POST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono uppercase text-muted-foreground hover:text-primary"
              >
                Open profile →
              </a>
            </header>
            <div className="bg-card flex justify-center">
              <iframe
                src={igSrc}
                title="Wavelength Infratech on Instagram"
                width="100%"
                height="600"
                style={{ border: "none", overflow: "hidden", display: "block", maxWidth: "540px" }}
                scrolling="no"
                frameBorder={0}
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                loading="lazy"
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
