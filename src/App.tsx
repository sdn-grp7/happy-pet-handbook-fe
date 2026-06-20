import { Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SiteLayout } from "@/components/SiteLayout";
import { HomePage } from "@/pages/HomePage";
import { BasicsPage } from "@/pages/BasicsPage";
import { NutritionPage } from "@/pages/NutritionPage";
import { TrainingPage } from "@/pages/TrainingPage";
import { HealthPage } from "@/pages/HealthPage";
import { MapPage } from "@/pages/MapPage";
import { CommunityPage } from "@/pages/CommunityPage";
import { ContactPage } from "@/pages/ContactPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="basics" element={<BasicsPage />} />
          <Route path="nutrition" element={<NutritionPage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
