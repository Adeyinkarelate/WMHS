import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { AssistantChat } from "@/components/patient/AssistantChat";

export default function AssistantPage() {
  return (
    <PageTransition>
      <PageHeader
        eyebrow="Guidance"
        title="Clinical assistant"
        description="Curated answers about pregnancy health. Not an unbounded chatbot. Escalates when a human should decide."
      />
      <div className="mt-6 max-w-2xl">
        <AssistantChat />
      </div>
    </PageTransition>
  );
}
