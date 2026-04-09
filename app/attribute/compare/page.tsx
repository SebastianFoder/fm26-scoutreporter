import { Suspense } from "react";
import ComparePageClient from "@/features/attribute/compare/ComparePageClient";

export default function AttributeComparePage() {
  return (
    <Suspense fallback={null}>
      <ComparePageClient />
    </Suspense>
  );
}
