import Navbar from "../pages/Navbar.jsx";
import Hero from "../pages/Hero.jsx";
import Features from "../pages/Features";
import Stats from "../pages/Stats.jsx";
import DashboardPreview from "../pages/DashboardPreview.jsx";
import AppCTA from "../pages/AppCTA.jsx";
import Footer from "../pages/Footer.jsx";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <DashboardPreview />
      <AppCTA />
      <Footer />
    </>
  );
};

export default LandingPage;
