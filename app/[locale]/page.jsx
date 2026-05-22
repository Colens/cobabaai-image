import GenerateSection from "@/components/views/index/generate-section";
import ApiKeyButtons from "@/components/api-key-buttons";
import config from "@/config";

const Home = async ({ params }) => {
  return (
    <>
      <header className="relative z-10 border-b border-violet-500/10 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img
              src={config.Logo}
              alt={config.Name}
              className="h-10 w-10 rounded-xl shadow-lg shadow-violet-500/20"
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
                {config.Name}
              </h1>
              <p className="text-xs text-muted-foreground">GPT-4o 批量绘画工具</p>
            </div>
          </div>
          <ApiKeyButtons />
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-7xl p-4">
        <GenerateSection />
      </main>
    </>
  );
};

export default Home;
