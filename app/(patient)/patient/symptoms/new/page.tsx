import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { SymptomForm } from "@/components/patient/SymptomForm";

export default function NewSymptomPage() {
  return (
    <PageTransition>
      <PageHeader
        eyebrow="Check-in"
        title="Log a symptom"
        description="Saving runs the WMHS risk engine on your latest symptoms and vitals."
      />
      <Card className="mt-6 max-w-xl">
        <SymptomForm />
      </Card>
    </PageTransition>
  );
}
