import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LegendItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface ScrollLegendProps {
  items: LegendItem[];
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export function ScrollLegend({
  items,
  className,
  threshold = 0.3,
  rootMargin = "-20% 0px -50% 0px"
}: ScrollLegendProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin,
      threshold: [0, 0.25, 0.5, 0.75, 1]
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const sectionId = entry.target.id;

        if (entry.isIntersecting) {
          sectionsRef.current.set(sectionId, entry.intersectionRatio);
        } else {
          sectionsRef.current.delete(sectionId);
        }
      });

      if (sectionsRef.current.size > 0) {
        let maxRatio = 0;
        let mostVisibleSection = "";

        sectionsRef.current.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            mostVisibleSection = id;
          }
        });

        if (mostVisibleSection && mostVisibleSection !== activeSection) {
          setActiveSection(mostVisibleSection);
        }
      }
    }, observerOptions);

    const sections = items.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];

    sections.forEach((section) => {
      if (section) {
        observerRef.current?.observe(section);
      }
    });

    const fallbackScroll = () => {
      if (sectionsRef.current.size === 0) {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          if (section) {
            const rect = section.getBoundingClientRect();
            const sectionTop = scrollY + rect.top;

            if (scrollY + windowHeight * 0.3 >= sectionTop) {
              setActiveSection(section.id);
              break;
            }
          }
        }
      }
    };

    fallbackScroll();
    window.addEventListener("scroll", fallbackScroll, { passive: true });

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener("scroll", fallbackScroll);
      sectionsRef.current.clear();
    };
  }, [items, rootMargin, activeSection]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div
      className={cn("fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden lg:block", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col space-y-4">
        {items.map((item, index) => {
          const isActive = activeSection === item.id;
          const itemIndex = items.findIndex(i => i.id === activeSection);
          const isPast = index < itemIndex;

          return (
            <div
              key={item.id}
              className="relative flex items-center cursor-pointer group"
              onClick={() => scrollToSection(item.id)}
              role="button"
              aria-label={`Navigate to ${item.name}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  scrollToSection(item.id);
                }
              }}
            >
              <div className="relative">
                <div
                  className={cn(
                    "h-0.5 transition-all duration-300 ease-out rounded-full",
                    isActive
                      ? "w-8 bg-blue-600 shadow-lg shadow-blue-600/50"
                      : isPast
                      ? "w-5 bg-gray-500"
                      : "w-4 bg-gray-300 group-hover:bg-gray-500 group-hover:w-5"
                  )}
                />
                {isActive && (
                  <div className="absolute inset-0 w-8 h-0.5 bg-blue-400 animate-pulse rounded-full" />
                )}
              </div>

              <div
                className={cn(
                  "ml-4 px-3 py-1.5 rounded-md transition-all duration-300 ease-out flex items-center gap-2",
                  "bg-white/95 backdrop-blur-sm shadow-md border",
                  isActive
                    ? "border-blue-600 shadow-lg shadow-blue-600/20"
                    : "border-gray-200 group-hover:border-gray-400",
                  isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
                )}
              >
                <span
                  className={cn(
                    "transition-colors duration-300",
                    isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                  )}
                >
                  {item.icon}
                </span>
                <span
                  className={cn(
                    "text-sm font-semibold whitespace-nowrap transition-colors duration-300",
                    isActive ? "text-blue-600" : "text-gray-700 group-hover:text-gray-900"
                  )}
                >
                  {item.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
