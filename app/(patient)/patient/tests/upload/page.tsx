import { PageTransition } from "@/components/shared/PageTransition";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { TestUpload } from "@/components/patient/TestUpload";

export default function UploadTestPage() {
  return (
    <PageTransition>
      <PageHeader
        eyebrow="Labs"
        title="Upload a test result"
        description="Blood glucose, haemoglobin, urine protein, blood pressure and heart rate all feed the same triage engine. Lab files go to Cloudinary."
      />
      <Card className="mt-6 max-w-xl">
        <TestUpload />
      </Card>
    </PageTransition>
  );
}
