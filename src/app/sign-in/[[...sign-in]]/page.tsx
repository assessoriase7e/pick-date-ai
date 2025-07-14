import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Pick Date AI</h1>
          <p className="text-muted-foreground">Faça login para acessar o sistema</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
