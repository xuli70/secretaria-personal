import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MessageSquare, Settings, Send, Loader2, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { ScrollArea } from '@/components/ui/scroll-area.jsx';
import './App.css';

// Componente principal de mensajería
function MessagingInterface() {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Cargar configuración desde localStorage
    const savedConfig = localStorage.getItem('n8n-config');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      console.log('[DEBUG - MessagingInterface] Configuración cargada:', parsedConfig);
      console.log('[DEBUG - MessagingInterface] Endpoint:', parsedConfig?.endpoint);
    }
    
    // Cargar mensajes guardados
    const savedMessages = localStorage.getItem('chat-messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  const saveMessages = (newMessages) => {
    localStorage.setItem('chat-messages', JSON.stringify(newMessages));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de archivo no permitido. Solo se aceptan PDF, JPG, PNG, GIF.');
        setSelectedFile(null);
        return;
      }

      // Validar tamaño para PDFs (aprox. 10 páginas = 1MB)
      if (file.type === 'application/pdf' && file.size > 1024 * 1024 * 1) { // 1MB
        alert('El PDF es demasiado grande. Máximo 1MB (aproximadamente 10 páginas).');
        setSelectedFile(null);
        return;
      }

      // Validar tamaño para imágenes (ej. 5MB)
      if (file.type.startsWith('image/') && file.size > 1024 * 1024 * 5) { // 5MB
        alert('La imagen es demasiado grande. Máximo 5MB.');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  const sendMessage = async () => {
    if ((!currentMessage.trim() && !selectedFile) || !config?.endpoint) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: currentMessage || (selectedFile ? `Archivo adjunto: ${selectedFile.name}` : ''),
      timestamp: new Date().toLocaleTimeString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setCurrentMessage('');
    setIsLoading(true);

    let fileData = null;
    if (selectedFile) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      await new Promise((resolve) => {
        reader.onloadend = () => {
          fileData = {
            base64: reader.result.split(',')[1], // Solo la parte Base64
            mimeType: selectedFile.type,
            fileName: selectedFile.name,
          };
          resolve();
        };
      });
    }

    try {
      const payload = {
        message: currentMessage,
        timestamp: new Date().toISOString(),
        ...(config.additionalData && JSON.parse(config.additionalData)),
        ...(fileData && { file: fileData }), // Incluir datos del archivo si existe
      };

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
          ...(config.customHeaders && JSON.parse(config.customHeaders))
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response || data.message || 'Respuesta recibida',
          timestamp: new Date().toLocaleTimeString()
        };

        const finalMessages = [...updatedMessages, botMessage];
        setMessages(finalMessages);
        saveMessages(finalMessages);
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: `Error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString()
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
    } finally {
      setIsLoading(false);
      setSelectedFile(null); // Limpiar archivo seleccionado después de enviar
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Limpiar el input de archivo
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chat-messages');
  };

  console.log('[DEBUG - MessagingInterface] Renderizando Input Area. config?.endpoint:', config?.endpoint);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Secretaria Personal
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {config?.endpoint && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Conectado
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="text-gray-600 hover:text-gray-800"
            >
              Limpiar Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                ¡Hola! Soy tu secretaria personal. ¿En qué puedo ayudarte hoy?
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  className={`max-w-xs sm:max-w-md lg:max-w-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : message.type === 'error'
                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <CardContent className="p-3">
                    <p className={`text-sm ${
                      message.type === 'error' ? 'text-red-700 dark:text-red-300' : ''
                    }`}>
                      {message.content}
                    </p>
                    <p className={`text-xs mt-1 opacity-70 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Procesando tu mensaje...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          {/* FORZAR RENDERIZADO DEL BOTÓN DE ADJUNTAR ARCHIVO PARA DEPURACIÓN */}
          <div className="flex space-x-2 items-end">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,image/*"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                console.log('[DEBUG] Botón de adjuntar archivo clickeado.');
                fileInputRef.current.click();
              }}
              className="shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1 min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={(!currentMessage.trim() && !selectedFile) || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {selectedFile && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Archivo seleccionado: {selectedFile.name} ({selectedFile.type})
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente de administración
function AdminPanel() {
  const [config, setConfig] = useState({
    endpoint: '',
    apiKey: '',
    customHeaders: '',
    additionalData: '',
    testEndpoint: ''
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('n8n-config');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig(parsedConfig);
      console.log('[DEBUG - AdminPanel] Configuración cargada:', parsedConfig);
      console.log('[DEBUG - AdminPanel] Endpoint:', parsedConfig?.endpoint);
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem('n8n-config', JSON.stringify(config));
    alert('Configuración guardada exitosamente');
    console.log('[DEBUG - AdminPanel] Configuración guardada:', config);
  };

  const testConnection = async () => {
    if (!config.testEndpoint) {
      alert('Por favor, ingresa un endpoint de prueba');
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const response = await fetch(config.testEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
          ...(config.customHeaders && JSON.parse(config.customHeaders))
        }
      });

      if (response.ok) {
        setTestResult({ success: true, message: 'Conexión exitosa' });
      } else {
        setTestResult({ 
          success: false, 
          message: `Error ${response.status}: ${response.statusText}` 
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `Error de conexión: ${error.message}` 
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const clearConfig = () => {
    if (confirm('¿Estás seguro de que quieres limpiar toda la configuración?')) {
      setConfig({
        endpoint: '',
        apiKey: '',
        customHeaders: '',
        additionalData: '',
        testEndpoint: ''
      });
      localStorage.removeItem('n8n-config');
      setTestResult(null);
      console.log('[DEBUG - AdminPanel] Configuración limpiada.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Panel de Administración
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Configura la conexión con tu instancia de n8n
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de n8n</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="endpoint">Endpoint Principal *</Label>
                <Input
                  id="endpoint"
                  value={config.endpoint}
                  onChange={(e) => setConfig({...config, endpoint: e.target.value})}
                  placeholder="https://tu-n8n.ejemplo.com/webhook/tu-webhook-id"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL del webhook de n8n donde se enviarán los mensajes
                </p>
              </div>

              <div>
                <Label htmlFor="testEndpoint">Endpoint de Prueba</Label>
                <Input
                  id="testEndpoint"
                  value={config.testEndpoint}
                  onChange={(e) => setConfig({...config, testEndpoint: e.target.value})}
                  placeholder="https://tu-n8n.ejemplo.com/webhook/test"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL para probar la conexión (opcional)
                </p>
              </div>

              <div>
                <Label htmlFor="apiKey">API Key / Token</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                  placeholder="Tu API key o token de autenticación"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Token de autenticación si es requerido (opcional)
                </p>
              </div>

              <div>
                <Label htmlFor="customHeaders">Headers Personalizados (JSON)</Label>
                <Textarea
                  id="customHeaders"
                  value={config.customHeaders}
                  onChange={(e) => setConfig({...config, customHeaders: e.target.value})}
                  placeholder='{"X-Custom-Header": "valor", "Another-Header": "otro-valor"}'
                  className="mt-1 font-mono text-sm"
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Headers adicionales en formato JSON (opcional)
                </p>
              </div>

              <div>
                <Label htmlFor="additionalData">Datos Adicionales (JSON)</Label>
                <Textarea
                  id="additionalData"
                  value={config.additionalData}
                  onChange={(e) => setConfig({...config, additionalData: e.target.value})}
                  placeholder='{"userId": "123", "source": "mobile-app"}'
                  className="mt-1 font-mono text-sm"
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Datos adicionales que se enviarán con cada mensaje (opcional)
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={saveConfig} className="bg-blue-600 hover:bg-blue-700">
                Guardar Configuración
              </Button>
              <Button 
                onClick={testConnection} 
                variant="outline"
                disabled={isTestingConnection}
              >
                {isTestingConnection ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Probando...
                  </>
                ) : (
                  'Probar Conexión'
                )}
              </Button>
              <Button onClick={clearConfig} variant="destructive">
                Limpiar Todo
              </Button>
            </div>

            {testResult && (
              <Card className={`mt-4 ${
                testResult.success 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
              }`}>
                <CardContent className="p-3">
                  <p className={`text-sm ${
                    testResult.success 
                      ? 'text-green-700 dark:text-green-300' 
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {testResult.success ? '✅' : '❌'} {testResult.message}
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Componente principal de la aplicación
function App() {
  console.log('[DEBUG - App] La aplicación se está renderizando. Versión de depuración.');
  return (
    <Router>
      <div className="min-h-screen">
        <Tabs defaultValue="chat" className="h-screen flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 m-0">
            <MessagingInterface />
          </TabsContent>
          
          <TabsContent value="admin" className="flex-1 m-0">
            <AdminPanel />
          </TabsContent>
        </Tabs>
      </div>
    </Router>
  );
}

export default App;


