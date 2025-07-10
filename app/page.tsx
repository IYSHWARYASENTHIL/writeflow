"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Save, 
  Download, 
  Share2, 
  Eye, 
  BarChart3, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Moon,
  Sun,
  Plus,
  Search,
  Settings,
  User,
  LogOut,
  Zap,
  TrendingUp,
  Clock,
  Users,
  Copy,
  Trash2,
  Star,
  Filter,
  Calendar,
  Target,
  Award,
  Globe,
  Lock,
  Unlock,
  MessageSquare,
  History,
  RefreshCw,
  Type,
  Mic,
  MicOff,
  Play,
  Pause,
  Volume2,
  Languages,
  Bookmark,
  Tag,
  Archive,
  Upload,
  FileDown,
  Printer,
  Mail,
  Scissors,
  Clipboard,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  PanelLeftClose,
  PanelRightClose,
  Focus,
  Brain,
  Sparkles,
  Shield,
  Database,
  Cloud,
  Wifi,
  WifiOff
} from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { AuthModal } from '@/components/auth/auth-modal';
import { DocumentList } from '@/components/documents/document-list';
import { DocumentEditor } from '@/components/editor/document-editor';

interface Document {
  id: string;
  title: string;
  content: string;
  word_count: number;
  reading_time: number;
  tags: string[];
  language: string;
  writing_goal: string;
  version: number;
  updated_at: string;
  created_at: string;
  status: string;
}

export default function WriteFlowPro() {
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [focusMode, setFocusMode] = useState(false);
  const { user, isAuthenticated, logout, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleRegister = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
    setActiveDocument(null);
  };

  const handleDocumentSelect = (document: Document) => {
    setActiveDocument(document);
  };

  const handleDocumentUpdate = (updatedDocument: Document) => {
    setActiveDocument(updatedDocument);
  };

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
        <div className="bg-background text-foreground">
          {/* Landing Page Header */}
          <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">WriteFlow Pro</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="ghost" onClick={handleLogin}>
                  Sign In
                </Button>
                <Button onClick={handleRegister}>
                  Get Started
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </header>

          {/* Landing Page Content */}
          <main className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-6 py-16">
              <div className="text-center mb-16">
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI-Powered Writing Assistant
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Transform your writing with intelligent suggestions, real-time analytics, 
                  and collaborative editing powered by advanced AI technology.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Button size="lg" onClick={handleRegister} className="px-8">
                    Start Writing for Free
                  </Button>
                  <Button size="lg" variant="outline" onClick={handleLogin}>
                    Sign In
                  </Button>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <Card className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">AI Suggestions</h3>
                  <p className="text-muted-foreground">
                    Get intelligent grammar, style, and clarity suggestions powered by advanced AI
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
                  <p className="text-muted-foreground">
                    Track readability, engagement, and writing quality with detailed analytics
                  </p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Collaboration</h3>
                  <p className="text-muted-foreground">
                    Share documents and collaborate with team members in real-time
                  </p>
                </Card>
              </div>

              {/* Demo Section */}
              <div className="bg-card rounded-lg border border-border p-8 mb-16">
                <h2 className="text-2xl font-bold text-center mb-8">See WriteFlow Pro in Action</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Before AI Enhancement</h3>
                    <Card className="p-4 bg-red-50 border-red-200">
                      <p className="text-sm">
                        "The quick brown fox jumps over the lazy dog. This sentence could be more concise and clear. 
                        We need to ensure our writing is engaging and professional."
                      </p>
                    </Card>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">After AI Enhancement</h3>
                    <Card className="p-4 bg-green-50 border-green-200">
                      <p className="text-sm">
                        "The agile fox leaps over the resting dog. This sentence needs clarity. 
                        It is essential to ensure our writing captivates and maintains professionalism."
                      </p>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">10M+</div>
                  <div className="text-muted-foreground">Words Enhanced</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
                  <div className="text-muted-foreground">Active Writers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
                  <div className="text-muted-foreground">Accuracy Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                  <div className="text-muted-foreground">AI Assistance</div>
                </div>
              </div>
            </div>
          </main>

          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            defaultMode={authMode}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">WriteFlow Pro</span>
              </div>
              {activeDocument && (
                <>
                  <div className="h-6 w-px bg-border" />
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {activeDocument.title}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      v{activeDocument.version}
                    </Badge>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => setFocusMode(!focusMode)}>
                <Focus className="w-4 h-4 mr-2" />
                Focus
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  {user?.full_name}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-73px)]">
          {/* Left Sidebar - Document List */}
          {!focusMode && (
            <DocumentList
              onDocumentSelect={handleDocumentSelect}
              selectedDocumentId={activeDocument?.id}
            />
          )}

          {/* Main Content */}
          <div className="flex-1">
            {activeDocument ? (
              <DocumentEditor
                document={activeDocument}
                onDocumentUpdate={handleDocumentUpdate}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-background via-background to-muted/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to WriteFlow Pro</h2>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Select a document from the sidebar or create a new one to start writing with AI assistance.
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Document
                    </Button>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Document
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}