import { notFound } from "next/navigation";
import SchreibenRunner from "@/components/SchreibenRunner";
import { getExam } from "@/lib/store";
import { sanitizeExam } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

export default async function SchreibenPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  const exam = await getExam(id);
  if (!exam) notFound();

  return (
    <SchreibenRunner
      exam={sanitizeExam(exam)}
      mode={search.zeit === "frei" ? "untimed" : "timed"}
    />
  );
}
