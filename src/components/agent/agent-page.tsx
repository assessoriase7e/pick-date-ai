"use client";
import AgentsContent from "../agents/agents-content";

export function AgentPage() {
  return (
    <div className="container py-10 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Agentes</h1>

      <AgentsContent />
    </div>
  );
}
