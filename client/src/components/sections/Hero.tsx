/**
 * Hero — Custom brand banner with baked-in artwork.
 * Clicking the banner scrolls to the featured dudes section.
 */

function scrollToFeaturedDudes() {
  document.getElementById("crew")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero() {
  return (
    <section className="relative w-full bg-background">
      <button
        type="button"
        onClick={scrollToFeaturedDudes}
        aria-label="Find a Dude Near You — scroll to dudes with trucks near you"
        className="group relative mx-auto block w-full max-w-md cursor-pointer border-0 bg-transparent p-0 sm:max-w-lg md:max-w-xl lg:max-w-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <img
          src="/images/hero-banner.png"
          alt="Dude With A Truck — real people, real trucks, real help. Three crew members in front of a pickup truck at sunset."
          width={1024}
          height={1536}
          className="block h-auto w-full transition-opacity group-hover:opacity-95"
          fetchPriority="high"
        />
      </button>
    </section>
  );
}
