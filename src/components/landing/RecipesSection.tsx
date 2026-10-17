import { YouTubeFacade } from '@/components/landing/YouTubeFacade';

const recipeVideos = [
  {
    title: 'Guacamole Clásico',
    videoId: 'K3xcGZLCitQ',
    description: 'El secreto de un buen guacamole está en la textura de la palta.',
  },
  {
    title: 'Avocado Toast',
    videoId: 'AUBakkI4aXg',
    description: 'Desayuno nutritivo y rápido de preparar.',
  },
  {
    title: 'Ensalada de Palta',
    videoId: 'yCCMKLakLKE',
    description: 'Fresca, ligera y perfecta para acompañar platos fuertes.',
  },
];

export function RecipesSection() {
  return (
    <section id="recetas" className="section-block bg-[#EDE4D8]">
      <div className="section-shell">
        <p data-reveal className="eyebrow text-[#A66A43]">Recetas paso a paso</p>
        <h2 data-reveal="1" className="mt-4 max-w-3xl text-balance text-4xl leading-tight text-[#2F5D3A] sm:text-5xl">Ideas fáciles para cocinar con palta.</h2>
        <p data-reveal="2" className="mt-4 max-w-3xl text-base leading-relaxed text-[#4D443B] sm:text-lg">Disfrutá de estas preparaciones utilizando nuestras mejores paltas orgánicas. Aquí te mostramos cómo integrarlas en tu dieta diaria.</p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {recipeVideos.map((video, index) => (
            <div key={video.videoId} data-reveal={String(index + 1)}>
              <div className="group h-full overflow-hidden rounded-2xl bg-[#FAF9F6] shadow-md transition-shadow hover:shadow-xl">
                <div className="aspect-video w-full">
                  <YouTubeFacade videoId={video.videoId} title={video.title} />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#2F5D3A]">{video.title}</h3>
                  <p className="mt-2 text-sm text-[#4D443B]">{video.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
