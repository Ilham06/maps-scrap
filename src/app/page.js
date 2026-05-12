import CitySelector from "@/components/CitySelector";
import Link from "next/link";

const STATS = [
  { value: "9", label: "kota" },
  { value: "100+", label: "cafe" },
  { value: "0", label: "starbucks" },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Top bar */}
      <nav className="px-6 py-3 flex items-center justify-between border-b border-border/50">
        <span className="text-sm font-semibold">wfc cafe finder</span>
        <span className="text-[11px] text-muted-foreground">v1</span>
      </nav>

      {/* Hero — warm background, dense */}
      <section className="bg-warm px-6 sm:px-12 py-10 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-primary mb-3 uppercase tracking-widest">
            buat kamu yang capek WFC di tempat yang sama
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.2] mb-4">
            Cafe unik ada di mana-mana.
            <br />
            <span className="text-muted-foreground">Kamu aja yang belum tau.</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
            Ketik aja mau cafe kayak gimana &mdash; sepi buat fokus, rame buat
            nongkrong, aesthetic buat konten &mdash; nanti kita cariin.
          </p>
        </div>
      </section>

      {/* City selector */}
      <section className="px-6 sm:px-12 py-8 border-b border-border/50">
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-widest">
          Pilih kota
        </p>
        <CitySelector />
      </section>

      {/* Stats strip */}
      <section className="px-6 sm:px-12 py-6 bg-secondary/50">
        <div className="max-w-3xl flex gap-8">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — compact */}
      <section className="px-6 sm:px-12 py-8 flex-1">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">
            Gimana caranya?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-semibold mb-1">1. Pilih kota</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Klik kota kamu di atas. Data cafe langsung muncul.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-semibold mb-1">2. Cerita mau apa</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ketik bebas. &ldquo;yang sepi buat nulis&rdquo;, &ldquo;deket
                sini, ada wifi&rdquo;, dll.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm font-semibold mb-1">3. Dapet rekomendasi</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Langsung dikasih cafe yang cocok, lengkap sama vibe dan jarak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background px-6 sm:px-12 py-6">
        <div className="max-w-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">projek iseng.</p>
            <p className="text-xs opacity-60">
              data dari google maps, difilter, dikasih vibe check. gratis.
            </p>
          </div>
          <Link
            href="https://github.com"
            className="text-xs opacity-60 hover:opacity-100 transition-opacity"
            target="_blank"
          >
            source code &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}
