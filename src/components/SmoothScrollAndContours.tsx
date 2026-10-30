import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  TOPO_VIEWBOX,
  TOPO_LAYER_1,
  TOPO_LAYER_2,
  TOPO_LAYER_3,
} from '../data/topographicPaths';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScrollAndContours() {
  const layer1Ref = useRef<SVGGElement>(null);
  const layer2Ref = useRef<SVGGElement>(null);
  const layer3Ref = useRef<SVGGElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      if (layer1Ref.current) {
        gsap.to(layer1Ref.current, {
          y: -140,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
          },
        });
      }
      if (layer2Ref.current) {
        gsap.to(layer2Ref.current, {
          y: -260,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.9,
          },
        });
      }
      if (layer3Ref.current) {
        gsap.to(layer3Ref.current, {
          y: -380,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2,
          },
        });
      }
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <svg
        viewBox={TOPO_VIEWBOX}
        preserveAspectRatio="xMidYMin slice"
        className="w-full h-[145dvh] fill-none"
      >
        {/* Stratum Contour Layer 1: Exact CV Warm Rose-Taupe Contours */}
        <g ref={layer1Ref} stroke="#cbb6ba" strokeWidth="0.65" opacity="0.62">
          {TOPO_LAYER_1.slice(0, -1).map((d, i) => (
            <path key={`l1-${i}`} d={d} />
          ))}
        </g>

        {/* Stratum Contour Layer 2: Glacier Slate Contours */}
        <g ref={layer2Ref} stroke="#8fabc2" strokeWidth="0.6" opacity="0.52">
          {TOPO_LAYER_2.map((d, i) => (
            <path key={`l2-${i}`} d={d} />
          ))}
        </g>

        {/* Stratum Contour Layer 3: Deep Cobalt & Warm Coral Elevation Contours */}
        <g ref={layer3Ref} strokeWidth="0.55" opacity="0.45">
          {TOPO_LAYER_3.map((d, i) => (
            <path
              key={`l3-${i}`}
              d={d}
              stroke={i % 4 === 0 ? '#f29f8b' : '#304774'}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
