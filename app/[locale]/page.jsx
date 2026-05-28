import GenerateSection from "@/components/views/index/generate-section";
import ApiKeyButtons from "@/components/api-key-buttons";
import config from "@/config";

const Home = async ({ params }) => {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <img
              src={config.Logo}
              alt={config.Name}
              className="h-8 w-8 rounded-lg object-contain transition-transform duration-200 hover:scale-105"
            />
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {config.Name}
              </h1>
              <p className="text-xs text-muted-foreground">GPT-4o 批量绘画工具</p>
            </div>
          </div>
          <ApiKeyButtons />
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-[1400px] p-4">
        <GenerateSection />
      </main>
    </>
  );
};

export default Home;
