import { Suspense } from "react";
import ComparePageClient from "./ComparePageClient";

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <ComparePageClient />
    </Suspense>
  );
}
