import { Loader2 } from "lucide-react";

const IsTableLoading = ({ isPageChanging }: { isPageChanging: boolean }) => {
  return (
    <>
      {isPageChanging && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background/50 absolute inset-0" />
          <div className="z-10 flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-medium">Carregando...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default IsTableLoading;
