import AppFooter from "./components/AppFooter";
import Navbar from "./components/Navbar";
import ContentRouter from "./pages/ContentRouter";


  const App: React.FC = () => {
    return (
      <div className="bg-light min-vh-100">
        <Navbar />
        <main>
          <ContentRouter />
        </main>
        <AppFooter />
      </div>
    );
  };

  export default App;