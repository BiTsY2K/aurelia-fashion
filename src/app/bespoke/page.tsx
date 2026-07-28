import type { Metadata } from 'next';
import InquiryForm from '@/components/forms/InquiryForm';
import SmartImage from '@/components/ui/SmartImage';
import Reveal from '@/components/ui/Reveal';
import { img } from '@/lib/media';

export const metadata: Metadata = {
  title: 'Bespoke Design',
  description: 'Commission a custom lehenga, saree, gown or girls’ outfit — designed with you and tailored to your measurements.',
  alternates: { canonical: '/bespoke' },
};

const PROMISES = [
  ['Sketch & swatches', 'A designer sketches your piece and sends fabric and embroidery samples before we begin.'],
  ['Two fittings', 'A trial fitting and a final fitting — in the atelier, or remotely with our measurement guide.'],
  ['Progress photos', 'You see your piece at every stage on WhatsApp, and approve before finishing.'],
] as const;

export default function BespokePage() {
  return (
    <section className="container-page py-12 md:py-16">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Reveal>
            <p className="eyebrow">Bespoke atelier</p>
            <h1 className="mt-3 text-display-lg">Designed with you. <span className="italic text-rose">Made for you.</span></h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-carbon-muted">
              Most bespoke pieces take 3–8 weeks depending on embroidery. Bridal lehengas, we recommend
              starting 3 months before the wedding.
            </p>
          </Reveal>
          <div className="mt-8 space-y-5">
            {PROMISES.map(([title, text], i) => (
              <Reveal key={title} delay={i * 0.1}>
                <div className="flex gap-4">
                  <span className="font-display text-2xl text-rose">0{i + 1}</span>
                  <div>
                    <p className="font-display text-lg">{title}</p>
                    <p className="mt-0.5 text-sm text-carbon-muted">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <div className="relative mt-10 hidden aspect-[16/10] overflow-hidden rounded-card lg:block">
              <SmartImage src={img('1610173827043-9db50e0d8ef9', 900)} alt="Bride in a hand-embroidered red lehenga" fill
                className="object-cover object-top" sizes="40vw" />
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <div className="rounded-[28px] border border-line bg-ivory-soft p-6 md:p-8">
            <h2 className="font-display text-2xl">Tell us about your piece</h2>
            <p className="mt-1 mb-6 text-sm text-carbon-muted">We reply within one working day.</p>
            <InquiryForm variant="bespoke" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
