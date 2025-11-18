import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search, ArrowLeft } from 'lucide-react';
import { ProfileType } from '@/types/user.types';

export interface TeacherNameData {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
}

interface SearchFormProps {
  profileType: ProfileType;
  onSearch: (query: string | TeacherNameData, searchType: 'name' | 'id') => void;
  onBack: () => void;
  isLoading?: boolean;
}

const SearchForm = ({ profileType, onSearch, onBack, isLoading }: SearchFormProps) => {
  const [searchType, setSearchType] = useState<'name' | 'id'>('name');
  const [query, setQuery] = useState('');
  const [teacherName, setTeacherName] = useState<TeacherNameData>({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: ''
  });

  const profileLabels = {
    student: { name: 'Nombre completo del alumno', id: 'Matrícula del alumno' },
    teacher: { name: 'Datos del docente', id: 'Matrícula del docente' },
    administrative: { name: 'Nombre completo', id: 'ID de empleado' },
  };

  // Reset form fields when search type or profile type changes
  useEffect(() => {
    setQuery('');
    setTeacherName({
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: ''
    });
  }, [searchType, profileType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profileType === 'teacher' && searchType === 'name') {
      // For teachers: allow partial searches.
      // Minimum requirement: Nombre(s). Apellidos (paterno/materno) son opcionales
      if (teacherName.nombre.trim()) {
        // Trim values to avoid sending empty whitespace
        const payload = {
          nombre: teacherName.nombre.trim(),
          apellidoPaterno: teacherName.apellidoPaterno.trim(),
          apellidoMaterno: teacherName.apellidoMaterno.trim()
        };
        onSearch(payload, searchType);
      }
    } else {
      // For other cases (teacher by ID, student, administrative)
      if (query.trim()) {
        onSearch(query.trim(), searchType);
      }
    }
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Regresar
      </Button>

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Búsqueda de usuario
          </h2>
          <p className="text-muted-foreground">
            Ingrese los datos para encontrar el perfil
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup
            value={searchType}
            onValueChange={(value) => setSearchType(value as 'name' | 'id')}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="name" id="name" />
              <Label htmlFor="name" className="flex-1 cursor-pointer font-normal">
                Buscar por nombre completo
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="id" id="id" />
              <Label htmlFor="id" className="flex-1 cursor-pointer font-normal">
                Buscar por {profileType === 'administrative' ? 'ID de empleado' : 'matrícula'}
              </Label>
            </div>
          </RadioGroup>

          {profileType === 'teacher' && searchType === 'name' ? (
            // Teacher name fields
            <div className="space-y-4">
              <Label className="text-base font-medium">
                {profileLabels[profileType].name}
              </Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="teacher-nombre" className="text-sm">
                    Nombre(s)
                  </Label>
                  <Input
                    id="teacher-nombre"
                    type="text"
                    placeholder="Ej: Juan Carlos"
                    value={teacherName.nombre}
                    onChange={(e) => setTeacherName(prev => ({ ...prev, nombre: e.target.value }))}
                    className="text-lg"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="teacher-paterno" className="text-sm">
                    Apellido Paterno <span className="text-xs text-muted-foreground">(opcional)</span>
                  </Label>
                  <Input
                    id="teacher-paterno"
                    type="text"
                    placeholder="Ej: Pérez"
                    value={teacherName.apellidoPaterno}
                    onChange={(e) => setTeacherName(prev => ({ ...prev, apellidoPaterno: e.target.value }))}
                    className="text-lg"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="teacher-materno" className="text-sm">
                    Apellido Materno <span className="text-xs text-muted-foreground">(opcional)</span>
                  </Label>
                  <Input
                    id="teacher-materno"
                    type="text"
                    placeholder="Ej: García"
                    value={teacherName.apellidoMaterno}
                    onChange={(e) => setTeacherName(prev => ({ ...prev, apellidoMaterno: e.target.value }))}
                    className="text-lg"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Puedes buscar solo por nombre o incluir apellido paterno/materno para refinar la búsqueda.
              </p>
            </div>
          ) : (
            // Regular input for other cases
            <div className="space-y-2">
              <Label htmlFor="search-query">
                {searchType === 'name' 
                  ? profileLabels[profileType].name 
                  : profileLabels[profileType].id}
              </Label>
              <Input
                id="search-query"
                type="text"
                placeholder={
                  searchType === 'name'
                    ? 'Ej: Juan Pérez García'
                    : profileType === 'administrative' 
                    ? 'Ej: ADM2019023'
                    : 'Ej: CUH532396454'
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="text-lg"
                disabled={isLoading}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full text-lg py-6"
            disabled={
              isLoading || 
              (profileType === 'teacher' && searchType === 'name'
                ? !teacherName.nombre.trim()
                : !query.trim())
            }
          >
            <Search className="w-5 h-5 mr-2" />
            {isLoading ? 'Buscando...' : 'Buscar usuario'}
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default SearchForm;
