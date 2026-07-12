import { Navigate, useParams } from "react-router-dom";

/** Deep links `/adoption/:id` open the listing modal on the adoption page. */
export function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/adoption" replace />;
  return <Navigate to={`/adoption?pet=${encodeURIComponent(id)}`} replace />;
}
