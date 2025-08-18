// --- src/components/Navbar.tsx ---
interface NavbarProps {
  setCurrentPage: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setCurrentPage }) => {
  return (
    <nav className="bg-gradient-to-r from-green-600 to-emerald-700 p-4 shadow-lg rounded-b-xl">
      <div className="container mx-auto flex justify-between items-center flex-wrap">
        <div className="text-white text-2xl font-bold font-inter tracking-wide">
          PestPredict
        </div>
        <div className="flex space-x-6 mt-2 md:mt-0">
          <button
            onClick={() => setCurrentPage('home')}
            className="text-white hover:text-green-200 transition duration-300 ease-in-out text-lg font-medium"
          >
            Home
          </button>
          <button
            onClick={() => setCurrentPage('predict')}
            className="text-white hover:text-green-200 transition duration-300 ease-in-out text-lg font-medium"
          >
            Predict
          </button>
          <button
            onClick={() => setCurrentPage('history')}
            className="text-white hover:text-green-200 transition duration-300 ease-in-out text-lg font-medium"
          >
            History
          </button>
          <button
            onClick={() => setCurrentPage('about')}
            className="text-white hover:text-green-200 transition duration-300 ease-in-out text-lg font-medium"
          >
            About
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;