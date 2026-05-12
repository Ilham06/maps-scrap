import CitySelector from "@/components/CitySelector";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-5xl mb-2">&#9749;</div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            WFC Cafe Finder
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Bosen WFC di cafe yang itu-itu aja? Temukan cafe unik di kotamu
          </p>

          <div className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              Pilih kota kamu
            </p>
            <div className="flex justify-center">
              <CitySelector />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl">&#128270;</div>
              <h3 className="font-semibold">Auto-Discover</h3>
              <p className="text-sm text-muted-foreground">
                Scraping Google Maps otomatis untuk menemukan cafe tersembunyi
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">&#129302;</div>
              <h3 className="font-semibold">AI-Powered Vibe</h3>
              <p className="text-sm text-muted-foreground">
                Deskripsi suasana cafe dari AI yang relatable dan engaging
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">&#128187;</div>
              <h3 className="font-semibold">WFC Score</h3>
              <p className="text-sm text-muted-foreground">
                Skor kelayakan WFC dari 0-100 biar ga salah pilih tempat
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
