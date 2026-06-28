import { Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SiteLayout } from "@/components/SiteLayout";
import { RequireAuth, GuestOnly } from "@/components/RequireAuth";
import { HomePage } from "@/pages/HomePage";
import { GuidePage } from "@/pages/GuidePage";
import { MapPage } from "@/pages/MapPage";
import { CommunityPage } from "@/pages/CommunityPage";
import { ContactPage } from "@/pages/ContactPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { AdoptionPage } from "@/pages/AdoptionPage";
import { PetDetailPage } from "@/pages/PetDetailPage";
import { ReputationPage } from "@/pages/ReputationPage";
import { PostAdoptionPage } from "@/pages/PostAdoptionPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<SiteLayout />}>
          {/* Public — browse & read */}
          <Route index element={<HomePage />} />
          <Route path="basics" element={<GuidePage />} />
          <Route path="nutrition" element={<GuidePage />} />
          <Route path="training" element={<GuidePage />} />
          <Route path="health" element={<GuidePage />} />
          <Route path="adoption" element={<AdoptionPage />} />
          <Route path="adoption/:id" element={<PetDetailPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="forum" element={<CommunityPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="reputation" element={<ReputationPage />} />
          <Route path="contact" element={<ContactPage />} />

          {/* Auth required */}
          <Route
            path="login"
            element={
              <GuestOnly>
                <LoginPage />
              </GuestOnly>
            }
          />
          <Route
            path="profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route path="pet-history" element={<Navigate to="/adoption" replace />} />
          <Route
            path="post-adoption"
            element={
              <RequireAuth>
                <PostAdoptionPage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
