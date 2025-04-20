import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();

  if (user) {
    redirect("/audios");
  }

  return (
    <main>
      <Navbar />
      <Hero />
    </main>
  );
}
