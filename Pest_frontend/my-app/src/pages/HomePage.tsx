// --- src/pages/HomePage.tsx ---
interface HomePageProps {
  setCurrentPage: (page: string) => void;
}
        

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-3xl text-center">
        <h1 className="text-5xl font-extrabold text-green-800 mb-6 font-inter leading-tight">
          Welcome to PestPredict!
        </h1>
        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          Your intelligent assistant for identifying common plant pests.
          Upload an image of your plant, and let our AI help you understand what's going on.
        </p>
        <div className="flex justify-center space-x-4">
          <button 
          onClick={() => setCurrentPage('predict')}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out text-lg">
            Get Started
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition duration-300 ease-in-out text-lg">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
