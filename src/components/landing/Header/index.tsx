"use client";
import Logo from "@/components/Logo";

const Header = () => {
  return (
    <nav className="bg-background/20 backdrop-blur-sm border-border border-b-[1px] flex items-center justify-between p-5 sticky top-0 w-full z-[100]">
      <Logo />
    </nav>
  );
};

export default Header;
