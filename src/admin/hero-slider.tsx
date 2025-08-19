import { useState } from 'react';
import AppSidebar from './components/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HeroSlider, { HeroSlide } from '@/components/HeroSlider';
import { Plus, Trash2 } from 'lucide-react';

export default function HeroSliderBuilder() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);

  const addSlide = () =>
    setSlides([
      ...slides,
      { image: '', heading: '', subheading: '', ctaText: '', ctaLink: '' },
    ]);

  const updateSlide = (index: number, field: keyof HeroSlide, value: string) => {
    const next = [...slides];
    next[index][field] = value;
    setSlides(next);
  };

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Hero Slider Builder</h1>
            <Button onClick={addSlide}>
              <Plus className="h-4 w-4 mr-2" /> Add slide
            </Button>
          </div>
          <div className="grid gap-6">
          {slides.map((slide, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Slide {idx + 1}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSlide(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`image-${idx}`}>Image URL</Label>
                  <Input
                    id={`image-${idx}`}
                    value={slide.image}
                    onChange={(e) => updateSlide(idx, 'image', e.target.value)}
                    placeholder="https://example.com/hero.jpg"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`heading-${idx}`}>Heading</Label>
                  <Input
                    id={`heading-${idx}`}
                    value={slide.heading}
                    onChange={(e) => updateSlide(idx, 'heading', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`sub-${idx}`}>Subheading</Label>
                  <Input
                    id={`sub-${idx}`}
                    value={slide.subheading}
                    onChange={(e) => updateSlide(idx, 'subheading', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`ctaText-${idx}`}>CTA Text</Label>
                    <Input
                      id={`ctaText-${idx}`}
                      value={slide.ctaText}
                      onChange={(e) => updateSlide(idx, 'ctaText', e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`ctaLink-${idx}`}>CTA Link</Label>
                    <Input
                      id={`ctaLink-${idx}`}
                      value={slide.ctaLink}
                      onChange={(e) => updateSlide(idx, 'ctaLink', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {slides.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Preview</h2>
            <HeroSlider slides={slides} />
          </div>
        )}
        </main>
      </div>
    </SidebarProvider>
  );
}
