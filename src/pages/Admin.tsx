import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import AdminContestsTab from "@/components/admin/AdminContestsTab";
import AdminApplicationsTab from "@/components/admin/AdminApplicationsTab";
import AdminResultsAndReviewsTab from "@/components/admin/AdminResultsAndReviewsTab";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminNavbar, { AdminTabs } from "@/components/admin/AdminNavbar";
import AdminCertificatesTab from "@/components/admin/AdminCertificatesTab";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminData } from "@/hooks/useAdminData";
import { useAdminHandlers } from "@/hooks/useAdminHandlers";

const Admin = () => {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'contests' | 'applications' | 'results' | 'reviews' | 'certificates' | 'settings'>('contests');
  const [applicationsSubTab, setApplicationsSubTab] = useState<'active' | 'archive' | 'trash'>('active');

  const auth = useAdminAuth();

  const data = useAdminData(auth.isAuthenticated);

  const handlers = useAdminHandlers({
    loadContests: data.loadContests,
    loadApplications: data.loadApplications,
    loadDeletedApplications: data.loadDeletedApplications,
    loadResults: data.loadResults,
  });

  if (!auth.isAuthenticated) {
    return (
      <AdminLoginForm
        login={auth.login}
        setLogin={auth.setLogin}
        password={auth.password}
        setPassword={auth.setPassword}
        handleLogin={auth.handleLogin}
        isLoading={auth.isLoading}
      />
    );
  }

  const handleCertificatesClick = () => {
    setActiveTab('certificates');
    if (data.certificatesLog.length === 0) {
      data.loadCertificates();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <AdminNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applicationsCount={data.applications.length}
        deletedApplicationsCount={data.deletedApplications.length}
        resultsCount={data.results.length}
        reviewsCount={data.reviews.length}
        certificatesLogLength={data.certificatesLog.length}
        onCertificatesClick={handleCertificatesClick}
        handleLogout={auth.handleLogout}
      />

      <div className="container mx-auto px-4 py-12">
        <AdminTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          applicationsCount={data.applications.length}
          deletedApplicationsCount={data.deletedApplications.length}
          resultsCount={data.results.length}
          reviewsCount={data.reviews.length}
          onCertificatesClick={handleCertificatesClick}
        />

        {activeTab === 'contests' && (
          <AdminContestsTab
            contests={data.contests}
            isModalOpen={handlers.isModalOpen}
            setIsModalOpen={handlers.setIsModalOpen}
            editingContest={handlers.editingContest}
            formData={handlers.formData}
            setFormData={handlers.setFormData}
            uploadingRules={handlers.uploadingRules}
            setUploadingRules={handlers.setUploadingRules}
            uploadingDiploma={handlers.uploadingDiploma}
            setUploadingDiploma={handlers.setUploadingDiploma}
            handleCreateContest={handlers.handleCreateContest}
            handleEditContest={handlers.handleEditContest}
            handleSubmit={handlers.handleSubmit}
            handleDelete={handlers.handleDelete}
            UPLOAD_URL={handlers.UPLOAD_URL}
          />
        )}

        {activeTab === 'applications' && (
          <AdminApplicationsTab
            contests={data.contests}
            applications={data.applications}
            deletedApplications={data.deletedApplications}
            applicationsSubTab={applicationsSubTab}
            setApplicationsSubTab={setApplicationsSubTab}
            applicationsWithResults={data.applicationsWithResults}
            isAppModalOpen={handlers.isAppModalOpen}
            setIsAppModalOpen={handlers.setIsAppModalOpen}
            editingApplication={handlers.editingApplication}
            setEditingApplication={handlers.setEditingApplication}
            appResult={handlers.appResult}
            setAppResult={handlers.setAppResult}
            appStatus={handlers.appStatus}
            setAppStatus={handlers.setAppStatus}
            isWorkPreviewOpen={handlers.isWorkPreviewOpen}
            setIsWorkPreviewOpen={handlers.setIsWorkPreviewOpen}
            workPreview={handlers.workPreview}
            setWorkPreview={handlers.setWorkPreview}
            isManualAppModalOpen={handlers.isManualAppModalOpen}
            setIsManualAppModalOpen={handlers.setIsManualAppModalOpen}
            manualAppFile={handlers.manualAppFile}
            setManualAppFile={handlers.setManualAppFile}
            manualContestName={handlers.manualContestName}
            setManualContestName={handlers.setManualContestName}
            submittingManualApp={handlers.submittingManualApp}
            manualAppUploadProgress={handlers.manualAppUploadProgress}
            handleCreateResultFromApplication={handlers.handleCreateResultFromApplication}
            handleDeleteApplication={handlers.handleDeleteApplication}
            handlePermanentDeleteApplication={handlers.handlePermanentDeleteApplication}
            handleRestoreApplication={handlers.handleRestoreApplication}
            handleManualAppSubmit={handlers.handleManualAppSubmit}
            loadApplications={data.loadApplications}
            loadDeletedApplications={data.loadDeletedApplications}
            APPLICATIONS_API_URL={handlers.APPLICATIONS_API_URL}
            UPLOAD_URL={handlers.UPLOAD_URL}
            toast={toast}
          />
        )}

        {(activeTab === 'results' || activeTab === 'reviews') && (
          <AdminResultsAndReviewsTab
            activeTab={activeTab}
            filteredResults={data.filteredResults}
            resultFilters={data.resultFilters}
            setResultFilters={data.setResultFilters}
            isResultModalOpen={handlers.isResultModalOpen}
            setIsResultModalOpen={handlers.setIsResultModalOpen}
            editingResult={handlers.editingResult}
            setEditingResult={handlers.setEditingResult}
            handleSaveResult={handlers.handleSaveResult}
            handleDeleteResult={handlers.handleDeleteResult}
            reviews={data.reviews}
            loadReviews={data.loadReviews}
            REVIEWS_API_URL="https://functions.poehali.dev/3daafc39-174c-4669-8e8a-71172a246929"
            toast={toast}
          />
        )}

        {activeTab === 'certificates' && (
          <AdminCertificatesTab
            certificatesLog={data.certificatesLog}
            certLoading={data.certLoading}
            onRefresh={data.loadCertificates}
            toast={toast}
          />
        )}

        {activeTab === 'settings' && (
          <AdminSettingsTab
            applicationFormUrl={data.applicationFormUrl}
            setApplicationFormUrl={data.setApplicationFormUrl}
            toast={toast}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;