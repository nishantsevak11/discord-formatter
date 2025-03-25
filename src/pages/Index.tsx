
import React from "react";
import TextEditor from "@/components/TextEditor";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <TextEditor />
      
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} TextSmith Formatter • All formatting takes place locally in your browser</p>
      </footer>
    </div>
  );
};

export default Index;
