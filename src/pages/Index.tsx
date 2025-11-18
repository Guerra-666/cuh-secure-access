import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import cuhLogo from '@/assets/cuh-logo.png';
import ProfileSelector from '@/components/ProfileSelector';
import SearchForm, { TeacherNameData } from '@/components/SearchForm';
import UserDetails from '@/components/UserDetails';
import UserSelectionDialog from '@/components/UserSelectionDialog';
import SuccessMessage from '@/components/SuccessMessage';
import { ProfileType, UserData } from '@/types/user.types';
import { ApiService } from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

type ViewState = 'profile-selection' | 'search' | 'user-selection' | 'user-details' | 'success';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewState>('profile-selection');
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [resetPhoneNumber, setResetPhoneNumber] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleProfileSelect = (profile: ProfileType) => {
    setSelectedProfile(profile);
    setCurrentView('search');
  };

  const handleSearch = async (query: string | TeacherNameData, searchType: 'name' | 'id') => {
    setIsLoading(true);
    
    try {
      let results: UserData[] = [];

      // Call appropriate API based on profile type
      if (selectedProfile === 'student') {
        results = await ApiService.searchStudent(query as string, searchType);
      } else if (selectedProfile === 'teacher') {
        results = await ApiService.searchTeacher(query, searchType);
      } else if (selectedProfile === 'administrative') {
        results = await ApiService.searchAdministrative(query as string, searchType);
      }

      if (results.length === 0) {
        toast.error('No se encontró ningún usuario con esos datos');
      } else if (results.length === 1) {
        // Solo un resultado: ir directo a detalles
        setUserData(results[0]);
        setCurrentView('user-details');
        toast.success('Usuario encontrado');
      } else {
        // Múltiples resultados: mostrar diálogo de selección
        setSearchResults(results);
        setCurrentView('user-selection');
        toast.info(`Se encontraron ${results.length} usuarios`);
      }
    } catch (error) {
      toast.error('Error al buscar usuario. Por favor, intente nuevamente.');
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!userData || !selectedProfile) return;

    console.log('handleResetPassword - Starting reset process');
    console.log('handleResetPassword - Selected Profile:', selectedProfile);
    console.log('handleResetPassword - User Data:', userData);

    setIsResetting(true);

    try {
      const result = await ApiService.resetPassword(selectedProfile, userData);

      console.log('handleResetPassword - API Result:', result);

      if (result.success) {
        console.log('handleResetPassword - Success! Setting phone number and changing view');
        setResetPhoneNumber(result.phoneNumber);
        setCurrentView('success');
        toast.success(result.message);
      } else {
        console.log('handleResetPassword - API returned success: false');
        toast.error('Error al restablecer la contraseña');
      }
    } catch (error) {
      console.log('handleResetPassword - Error caught:', error);
      toast.error('Error al restablecer la contraseña. Por favor, intente nuevamente.');
      console.error('Reset password error:', error);
    } finally {
      setIsResetting(false);
      console.log('handleResetPassword - Process finished, isResetting set to false');
    }
  };

  const handleBackToProfileSelection = () => {
    setCurrentView('profile-selection');
    setSelectedProfile(null);
    setUserData(null);
    setSearchResults([]);
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setUserData(null);
    setSearchResults([]);
  };

  const handleUserSelect = (user: UserData) => {
    setUserData(user);
    setSearchResults([]);
    setCurrentView('user-details');
    toast.success('Usuario seleccionado');
  };

  const handleCloseSelection = () => {
    setCurrentView('search');
    setSearchResults([]);
  };

  const handleReset = () => {
    setCurrentView('profile-selection');
    setSelectedProfile(null);
    setUserData(null);
    setSearchResults([]);
    setResetPhoneNumber('');
  };

  const handleGoHome = () => {
    setCurrentView('profile-selection');
    setSelectedProfile(null);
    setUserData(null);
    setSearchResults([]);
    setResetPhoneNumber('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={cuhLogo} 
                alt="Centro Universitario Hidalguense" 
                className="h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-primary">SIREC</h1>
                <p className="text-sm text-muted-foreground">
                  Sistema Integral de Recuperación de Credenciales
                </p>
              </div>
            </div>
            <Link to="/sige">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Usuarios SIGE
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {currentView === 'profile-selection' && (
          <ProfileSelector onSelectProfile={handleProfileSelect} />
        )}

        {currentView === 'search' && selectedProfile && (
          <SearchForm
            profileType={selectedProfile}
            onSearch={handleSearch}
            onBack={handleBackToProfileSelection}
            isLoading={isLoading}
          />
        )}

        {currentView === 'user-selection' && selectedProfile && (
          <UserSelectionDialog
            open={true}
            onClose={handleCloseSelection}
            onSelect={handleUserSelect}
            users={searchResults}
            profileType={selectedProfile}
          />
        )}

        {currentView === 'user-details' && selectedProfile && userData && (
          <UserDetails
            profileType={selectedProfile}
            userData={userData}
            onBack={handleBackToSearch}
            onResetPassword={handleResetPassword}
            isResetting={isResetting}
          />
        )}

        {currentView === 'success' && (
          <>
            {console.log('Rendering success view - resetPhoneNumber:', resetPhoneNumber)}
            <SuccessMessage
              phoneNumber={resetPhoneNumber || 'No disponible'}
              onReset={handleReset}
              onGoHome={handleGoHome}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Centro Universitario Hidalguense. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
