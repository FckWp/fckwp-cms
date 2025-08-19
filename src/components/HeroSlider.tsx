import React, { useEffect, useState } from 'react';

export interface HeroSlide {
  image: string;
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  interval?: number;
}

export default function HeroSlider({ slides, interval = 5000 }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(id);
  }, [slides.length, interval]);

  if (slides.length === 0) return null;

  return (
    <div className="relative overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.heading ?? `Slide ${index + 1}`}
            className="w-full h-96 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white p-4">
            {slide.heading && (
              <h2 className="text-3xl font-bold mb-2">{slide.heading}</h2>
            )}
            {slide.subheading && <p className="mb-4">{slide.subheading}</p>}
            {slide.ctaText && slide.ctaLink && (
              <a
                href={slide.ctaLink}
                className="bg-primary px-4 py-2 rounded"
              >
                {slide.ctaText}
              </a>
            )}
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full ${
              idx === current ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
