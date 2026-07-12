import { Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SiteLayout } from "@/components/SiteLayout";
import { RequireAuth, GuestOnly } from "@/features/auth/components/RequireAuth";
import { HomePage } from "@/pages/HomePage";
import { GuidePage } from "@/features/guides/pages/GuidePage";
import { MapPage } from "@/features/pets/pages/MapPage";
import { CommunityPage } from "@/features/forum/pages/CommunityPage";
import { ContactPage } from "@/features/contact/pages/ContactPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProfilePage } from "@/features/auth/pages/ProfilePage";
import { AdoptionPage } from "@/features/adoption/pages/AdoptionPage";
import { PetDetailPage } from "@/features/pets/pages/PetDetailPage";
import { ReputationPage } from "@/features/reputation/pages/ReputationPage";
import { PetHistoryPage } from "@/features/pet-history/pages/PetHistoryPage";
import { PostAdoptionPage } from "@/features/post-adoption/pages/PostAdoptionPage";
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
          <Route path="pet-history" element={<PetHistoryPage />} />
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
