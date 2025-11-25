import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-3">Word Games</h1>
        <p className="text-muted-foreground text-lg">Choose your game to start learning</p>
      </div>
      
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button
          onClick={() => navigate("/word-pair")}
          size="lg"
          className="w-full h-20 text-xl font-semibold"
        >
          Word Pair
        </Button>
        
        <Button
          onClick={() => navigate("/enjoy")}
          size="lg"
          variant="secondary"
          className="w-full h-20 text-xl font-semibold"
        >
          Enjoy
        </Button>
      </div>
    </div>
  );
};

export default Home;
