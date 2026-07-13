import { Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SiteLayout } from "@/components/SiteLayout";
import {
  RequireAuth,
  RequireAdmin,
  GuestOnly,
  RedirectAdminToPanel,
} from "@/features/auth/components/RequireAuth";
import { HomePage } from "@/pages/HomePage";
import { GuidePage } from "@/features/guides/pages/GuidePage";
import { AdminGuidesPage } from "@/features/guides/pages/AdminGuidesPage";
import { AdminAdoptionPage } from "@/features/adoption/pages/AdminAdoptionPage";
import { IncomingAdoptionRequestsPage } from "@/features/adoption/pages/IncomingAdoptionRequestsPage";
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { MapPage } from "@/features/pets/pages/MapPage";
import { CommunityPage } from "@/features/forum/pages/CommunityPage";
import { ContactPage } from "@/features/contact/pages/ContactPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProfilePage } from "@/features/auth/pages/ProfilePage";
import { AdoptionPage } from "@/features/adoption/pages/AdoptionPage";
import { PetDetailPage } from "@/features/pets/pages/PetDetailPage";
import { ReputationPage } from "@/features/reputation/pages/ReputationPage";
import { PetHistoryPage } from "@/features/pet-history/pages/PetHistoryPage";
import { ListPetPage } from "@/features/pets/pages/ListPetPage";
import { PostAdoptionPage } from "@/features/post-adoption/pages/PostAdoptionPage";
import { PublicProfilePage } from "@/features/auth/pages/PublicProfilePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

/** Public pages — signed-in admins are sent to /admin. */
function PublicAppShell() {
  return (
    <RedirectAdminToPanel>
      <SiteLayout />
    </RedirectAdminToPanel>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="guides" element={<AdminGuidesPage />} />
          <Route path="adoption" element={<AdminAdoptionPage />} />
        </Route>

        {/* Login outside RedirectAdminToPanel so logout can reach it. */}
        <Route element={<SiteLayout />}>
          <Route
            path="login"
            element={
              <GuestOnly>
                <LoginPage />
              </GuestOnly>
            }
          />
        </Route>

        <Route element={<PublicAppShell />}>
          <Route index element={<HomePage />} />
          <Route path="guides/:slug" element={<GuidePage />} />
          <Route path="basics" element={<Navigate to="/guides/basics" replace />} />
          <Route path="nutrition" element={<Navigate to="/guides/nutrition" replace />} />
          <Route path="training" element={<Navigate to="/guides/training" replace />} />
          <Route path="health" element={<Navigate to="/guides/health" replace />} />
          <Route path="adoption" element={<AdoptionPage />} />
          <Route path="adoption/:id" element={<PetDetailPage />} />
          <Route
            path="list-pet"
            element={
              <RequireAuth>
                <ListPetPage />
              </RequireAuth>
            }
          />
          <Route path="map" element={<MapPage />} />
          <Route path="forum" element={<CommunityPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="reputation" element={<ReputationPage />} />
          <Route path="users/:id" element={<PublicProfilePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route
            path="profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="adoption-requests"
            element={
              <RequireAuth>
                <IncomingAdoptionRequestsPage />
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
