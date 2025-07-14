import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser();

  if (user) {
    redirect("/calendar");
  }

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
