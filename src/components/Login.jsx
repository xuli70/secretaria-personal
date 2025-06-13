import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import './Login.css';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Clave de acceso hardcodeada (se puede cambiar por una más segura)
  const ACCESS_KEY = 'secretaria2024';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular un pequeño delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (password === ACCESS_KEY) {
      // Guardar estado de autenticación en localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authTimestamp', Date.now().toString());
      onLogin();
    } else {
      setError('Clave de acceso incorrecta');
    }

    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <Card className="login-card">
          <CardHeader className="text-center">
            <div className="login-icon">
              <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Secretaria Personal
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Ingresa tu clave de acceso para continuar
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Clave de Acceso</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu clave de acceso"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="text-red-600 dark:text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={!password.trim() || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verificando...
                  </>
                ) : (
                  'Acceder'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Login;
