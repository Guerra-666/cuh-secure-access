/**
 * UserSelectionDialog Component
 * 
 * Ventana de diálogo que muestra múltiples resultados de búsqueda.
 * Permite al usuario seleccionar entre varios usuarios similares
 * cuando hay más de un resultado.
 * 
 * DISEÑO:
 * - Dialog modal centrado con overlay oscuro
 * - Header: Título + número de resultados
 * - Body: Grid de tarjetas compactas con datos de usuario
 * - Footer: Botón cancelar
 * - Tarjetas clickeables con hover effect
 * 
 * COLORES:
 * - Card hover: bg-accent (hsl(210 40% 96.1%))
 * - Border: border (hsl(214.3 31.8% 91.4%))
 * - Texto primario: foreground (hsl(222.2 84% 4.9%))
 * - Texto secundario: muted-foreground (hsl(215.4 16.3% 46.9%))
 */

import { ProfileType, Student, Teacher, Administrative } from '@/types/user.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, GraduationCap, Briefcase, Phone } from 'lucide-react';

interface UserSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (user: Student | Teacher | Administrative) => void;
  users: (Student | Teacher | Administrative)[];
  profileType: ProfileType;
}

const UserSelectionDialog = ({
  open,
  onClose,
  onSelect,
  users,
  profileType
}: UserSelectionDialogProps) => {
  /**
   * Obtiene el ícono apropiado según el tipo de perfil
   */
  const getProfileIcon = () => {
    switch (profileType) {
      case 'student':
        return <GraduationCap className="h-5 w-5 text-primary" />;
      case 'teacher':
        return <User className="h-5 w-5 text-primary" />;
      case 'administrative':
        return <Briefcase className="h-5 w-5 text-primary" />;
    }
  };

  /**
   * Obtiene el nombre completo según el tipo de usuario
   */
  const getUserName = (user: Student | Teacher | Administrative): string => {
    if ('nombre_completo' in user) {
      return user.nombre_completo;
    }
    if ('nombre' in user && 'paterno' in user && 'materno' in user) {
      const teacher = user as Teacher;
      return `${teacher.nombre} ${teacher.paterno} ${teacher.materno}`.trim();
    }
    return '';
  };

  /**
   * Obtiene el identificador (matrícula o clave)
   */
  const getUserId = (user: Student | Teacher | Administrative): string => {
    if ('matricula' in user) {
      return user.matricula || user.cuenta || '';
    }
    if ('clave_docente' in user) {
      return (user as Teacher).clave_docente;
    }
    return '';
  };

  /**
   * Obtiene información adicional (carrera, grado impartido)
   */
  const getAdditionalInfo = (user: Student | Teacher | Administrative): string => {
    if ('carrera' in user) {
      return user.carrera || '';
    }
    if ('gradoimparte' in user) {
      return (user as Teacher).gradoimparte || '';
    }
    return '';
  };

  /**
   * Obtiene el teléfono del usuario
   */
  const getUserPhone = (user: Student | Teacher | Administrative): string => {
    if ('telefono_celular' in user) {
      return (user as Teacher).telefono_celular || '';
    }
    if ('telefono' in user) {
      return user.telefono || '';
    }
    return '';
  };

  /**
   * Obtiene el label del tipo de perfil
   */
  const getProfileLabel = (): string => {
    switch (profileType) {
      case 'student':
        return 'Estudiante';
      case 'teacher':
        return 'Docente';
      case 'administrative':
        return 'Administrativo';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        {/* Header con título y número de resultados */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {users.length} resultado{users.length !== 1 ? 's' : ''} en esta búsqueda
          </DialogTitle>
          <DialogDescription className="text-base">
            Seleccione el usuario con el que desea realizar la corrección
          </DialogDescription>
        </DialogHeader>

        {/* Grid de tarjetas de usuario */}
        <div className="grid gap-3 py-4">
          {users.map((user, index) => {
            const userName = getUserName(user);
            const userId = getUserId(user);
            const additionalInfo = getAdditionalInfo(user);
            const phone = getUserPhone(user);

            return (
              <Card
                key={`${userId}-${index}`}
                className="cursor-pointer transition-all hover:bg-accent hover:shadow-md border-2 hover:border-primary/50"
                onClick={() => onSelect(user)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Información principal del usuario */}
                    <div className="flex-1 space-y-2">
                      {/* Nombre y badge de tipo */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {getProfileIcon()}
                        <h3 className="font-semibold text-lg text-foreground">
                          {userName || 'Nombre no disponible'}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {getProfileLabel()}
                        </Badge>
                      </div>

                      {/* Grid de información adicional */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        {/* ID/Matrícula/Clave */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-muted-foreground">
                            {profileType === 'teacher' ? 'Clave:' : 'Matrícula:'}
                          </span>
                          <span className="text-foreground">
                            {userId || 'No disponible'}
                          </span>
                        </div>

                        {/* Carrera/Grado académico */}
                        {additionalInfo && (
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-muted-foreground">
                              {profileType === 'student' || profileType === 'administrative'
                                ? 'Carrera:'
                                : 'Grado:'}
                            </span>
                            <span className="text-foreground truncate">
                              {additionalInfo}
                            </span>
                          </div>
                        )}

                        {/* Teléfono si está disponible */}
                        {phone && (
                          <div className="flex items-center gap-1.5 col-span-full sm:col-span-1">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-foreground">
                              {phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Indicador visual de clickeable */}
                    <div className="text-muted-foreground">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer con botón cancelar */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserSelectionDialog;
