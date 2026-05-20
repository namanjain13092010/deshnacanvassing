import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import CinematicLoader from "@/components/CinematicLoader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Highlights from "@/components/Highlights";
import ProductCinema from "@/components/ProductCinema";
import Products from "@/components/Products";
import Story from "@/components/Story";
import Founder from "@/components/Founder";
import Trust from "@/components/Trust";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

function Home() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [loaded]);

  return (
    <div className="App">
      {!loaded && <CinematicLoader onDone={() => setLoaded(true)} />}
      <div className="grain-fixed" aria-hidden />
      <Navbar />
      <main>
        <Hero />
        <Highlights />
        <ProductCinema />
        <Products />
        <Story />
        <Founder />
        <Trust />
        <Contact />
      </main>
      <Footer />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(21,17,13,0.95)",
            color: "#f0e6d2",
            border: "1px solid rgba(212,161,73,0.3)",
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
