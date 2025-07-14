import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Pick Date AI</h1>
          <p className="text-muted-foreground">Crie uma conta para acessar o sistema</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
            },
          }}
          routing="path"
          path="/sign-up"
        />
      </div>
    </div>
  );
}
