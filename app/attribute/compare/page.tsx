import { Suspense } from "react";
import ComparePageClient from "../../(views)/compare/ComparePageClient";

export default function AttributeComparePage() {
  return (
    <Suspense fallback={null}>
      <ComparePageClient />
    </Suspense>
  );
}
