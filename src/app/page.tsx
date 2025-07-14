import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

export default async function Home() {
  return (
    <div className="mx-auto">
      <Header />
      <Hero />
      {/* <Features /> */}
      {/* <Testimonials /> */}
      <Pricing />
      {/* <Brands /> */}
      <Footer />
    </div>
  );
}
