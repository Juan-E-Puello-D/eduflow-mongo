import AppFooter from "./components/AppFooter";
import AppNavbar from "./components/AppNavbar";
import ContentRouter from "./pages/ContentRouter";


  const App: React.FC = () => {
    return (
      <div className="bg-light min-vh-100">
        <AppNavbar />
        <main>
          <ContentRouter />
        </main>
        <AppFooter />
      </div>
    );
  };

  export default App;