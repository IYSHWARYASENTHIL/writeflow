"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Folder,
  Search,
  Settings,
  Palette,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Quote,
  Link,
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

interface Document {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  wordCount: number;
  shared: boolean;
  starred: boolean;
  tags: string[];
  language: string;
  readingTime: number;
  collaborators: string[];
  version: number;
  isPublic: boolean;
}

interface Suggestion {
  id: string;
  type: 'grammar' | 'style' | 'clarity' | 'tone' | 'plagiarism' | 'vocabulary';
  text: string;
  suggestion: string;
  explanation: string;
  position: { start: number; end: number };
  severity: 'error' | 'warning' | 'info';
  confidence: number;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  position: { start: number; end: number };
  resolved: boolean;
}

interface WritingGoal {
  type: 'word_count' | 'time' | 'pages';
  target: number;
  current: number;
  deadline?: Date;
}

export default function DocumentEditor() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'My First Document',
      content: 'This is a sample document with some text that needs improvement. The quick brown fox jumps over the lazy dog. This sentence could be more concise and clear. We need to ensure our writing is engaging and professional.',
      lastModified: new Date(),
      wordCount: 35,
      shared: false,
      starred: true,
      tags: ['draft', 'important'],
      language: 'en-US',
      readingTime: 1,
      collaborators: ['john@example.com', 'jane@example.com'],
      version: 3,
      isPublic: false
    }
  ]);
  
  const [activeDocument, setActiveDocument] = useState<Document | null>(documents[0]);
  const [content, setContent] = useState(activeDocument?.content || '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [writingGoal, setWritingGoal] = useState('professional');
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [gradeLevel, setGradeLevel] = useState(8);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [writingGoals, setWritingGoals] = useState<WritingGoal[]>([
    { type: 'word_count', target: 1000, current: 350 },
    { type: 'time', target: 60, current: 25 }
  ]);
  const [plagiarismScore, setPlagiarismScore] = useState(2);
  const [vocabularyScore, setVocabularyScore] = useState(85);
  const [toneAnalysis, setToneAnalysis] = useState({
    formal: 75,
    confident: 80,
    optimistic: 65,
    analytical: 90
  });
  
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Enhanced mock suggestions
  useEffect(() => {
    const mockSuggestions: Suggestion[] = [
      {
        id: '1',
        type: 'grammar',
        text: 'needs improvement',
        suggestion: 'needs improving',
        explanation: 'Use the gerund form for better flow',
        position: { start: 50, end: 67 },
        severity: 'warning',
        confidence: 95
      },
      {
        id: '2',
        type: 'style',
        text: 'This sentence could be more concise and clear',
        suggestion: 'This sentence needs clarity',
        explanation: 'Shorter sentences are more impactful',
        position: { start: 120, end: 164 },
        severity: 'info',
        confidence: 80
      },
      {
        id: '3',
        type: 'vocabulary',
        text: 'engaging',
        suggestion: 'captivating',
        explanation: 'More sophisticated vocabulary choice',
        position: { start: 200, end: 208 },
        severity: 'info',
        confidence: 70
      },
      {
        id: '4',
        type: 'tone',
        text: 'We need to ensure',
        suggestion: 'It is essential to ensure',
        explanation: 'More formal tone for professional writing',
        position: { start: 230, end: 245 },
        severity: 'info',
        confidence: 85
      }
    ];
    
    setSuggestions(mockSuggestions);
  }, [content]);

  // Mock comments
  useEffect(() => {
    const mockComments: Comment[] = [
      {
        id: '1',
        text: 'This section needs more detail about the methodology.',
        author: 'John Doe',
        timestamp: new Date(Date.now() - 3600000),
        position: { start: 100, end: 150 },
        resolved: false
      },
      {
        id: '2',
        text: 'Great point! Consider adding statistics to support this.',
        author: 'Jane Smith',
        timestamp: new Date(Date.now() - 7200000),
        position: { start: 180, end: 220 },
        resolved: true
      }
    ];
    
    setComments(mockComments);
  }, []);

  // Update analytics
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setReadingTime(Math.ceil(words.length / 200));
    
    const avgWordsPerSentence = words.length / (content.split(/[.!?]+/).length - 1 || 1);
    setGradeLevel(Math.min(Math.max(Math.floor(avgWordsPerSentence * 0.4 + 6), 6), 16));
    
    // Update writing goals
    setWritingGoals(prev => prev.map(goal => 
      goal.type === 'word_count' ? { ...goal, current: words.length } : goal
    ));
  }, [content]);

  // Auto-save simulation
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (activeDocument && content !== activeDocument.content) {
        setIsAutoSaving(true);
        setTimeout(() => {
          setIsAutoSaving(false);
          if (activeDocument) {
            const updatedDoc = {
              ...activeDocument,
              content,
              lastModified: new Date(),
              wordCount,
              version: activeDocument.version + 1
            };
            setDocuments(prev => prev.map(doc => 
              doc.id === activeDocument.id ? updatedDoc : doc
            ));
            setActiveDocument(updatedDoc);
          }
        }, 1000);
      }
    }, 2000);

    return () => clearTimeout(autoSave);
  }, [content, activeDocument, wordCount]);

  // Online status detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const applySuggestion = (suggestion: Suggestion) => {
    const newContent = content.slice(0, suggestion.position.start) + 
                      suggestion.suggestion + 
                      content.slice(suggestion.position.end);
    setContent(newContent);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const dismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const addComment = (text: string, position: { start: number; end: number }) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      text,
      author: 'Current User',
      timestamp: new Date(),
      position,
      resolved: false
    };
    setComments(prev => [...prev, newComment]);
  };

  const resolveComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId ? { ...comment, resolved: true } : comment
    ));
  };

  const toggleStar = (docId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, starred: !doc.starred } : doc
    ));
  };

  const duplicateDocument = (doc: Document) => {
    const newDoc: Document = {
      ...doc,
      id: Date.now().toString(),
      title: `${doc.title} (Copy)`,
      lastModified: new Date(),
      version: 1
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  const exportDocument = (format: 'pdf' | 'docx' | 'txt' | 'md') => {
    // Mock export functionality
    console.log(`Exporting document as ${format}`);
  };

  const startVoiceRecording = () => {
    setVoiceRecording(true);
    // Mock voice recording
    setTimeout(() => {
      setVoiceRecording(false);
      setContent(prev => prev + " This text was added via voice recording.");
    }, 3000);
  };

  const toggleSpeechSynthesis = () => {
    setSpeechSynthesis(!speechSynthesis);
    if (!speechSynthesis && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      window.speechSynthesis.speak(utterance);
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'grammar': return <AlertCircle className="w-4 h-4" />;
      case 'style': return <Palette className="w-4 h-4" />;
      case 'clarity': return <Lightbulb className="w-4 h-4" />;
      case 'tone': return <Users className="w-4 h-4" />;
      case 'vocabulary': return <Brain className="w-4 h-4" />;
      case 'plagiarism': return <Shield className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      case 'style': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
      case 'clarity': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'tone': return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950';
      case 'vocabulary': return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950';
      case 'plagiarism': return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950';
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {activeDocument?.title || 'Untitled Document'}
                </span>
                <Badge variant="outline" className="text-xs">
                  v{activeDocument?.version || 1}
                </Badge>
                {isAutoSaving && (
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Saving...</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
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
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Separator orientation="vertical" className="h-6" />
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

        <div className="flex h-[calc(100vh-73px)]">
          {/* Left Sidebar */}
          {showLeftPanel && !focusMode && (
            <div className="w-80 border-r border-border bg-card/30 backdrop-blur supports-[backdrop-filter]:bg-card/30">
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Button className="flex-1" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Document
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Tabs defaultValue="recent" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                    <TabsTrigger value="starred">Starred</TabsTrigger>
                    <TabsTrigger value="shared">Shared</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="recent" className="mt-4">
                    <ScrollArea className="h-60">
                      <div className="space-y-2">
                        {filteredDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                              activeDocument?.id === doc.id
                                ? 'bg-primary/10 border border-primary/20'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => {
                              setActiveDocument(doc);
                              setContent(doc.content);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{doc.title}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {doc.wordCount} words • {doc.readingTime} min read
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {doc.lastModified.toLocaleDateString()}
                                </div>
                                {doc.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {doc.tags.map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleStar(doc.id);
                                  }}
                                >
                                  <Star className={`w-3 h-3 ${doc.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateDocument(doc);
                                  }}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="starred" className="mt-4">
                    <ScrollArea className="h-60">
                      <div className="space-y-2">
                        {filteredDocuments.filter(doc => doc.starred).map((doc) => (
                          <div key={doc.id} className="p-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                            <div className="font-medium text-sm">{doc.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {doc.wordCount} words • {doc.lastModified.toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="shared" className="mt-4">
                    <ScrollArea className="h-60">
                      <div className="space-y-2">
                        {filteredDocuments.filter(doc => doc.shared).map((doc) => (
                          <div key={doc.id} className="p-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                            <div className="font-medium text-sm">{doc.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Shared with {doc.collaborators.length} people
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>

                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>AI Suggestions</span>
                    <Switch
                      checked={showSuggestions}
                      onCheckedChange={setShowSuggestions}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Comments</span>
                    <Switch
                      checked={showComments}
                      onCheckedChange={setShowComments}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Writing Goal</div>
                    <select
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                      value={writingGoal}
                      onChange={(e) => setWritingGoal(e.target.value)}
                    >
                      <option value="professional">Professional</option>
                      <option value="academic">Academic</option>
                      <option value="creative">Creative</option>
                      <option value="casual">Casual</option>
                      <option value="technical">Technical</option>
                      <option value="marketing">Marketing</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Language</div>
                    <select
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es-ES">Spanish</option>
                      <option value="fr-FR">French</option>
                      <option value="de-DE">German</option>
                      <option value="it-IT">Italian</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">Writing Goals</div>
                    {writingGoals.map((goal, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">
                            {goal.type.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {goal.current}/{goal.target}
                          </span>
                        </div>
                        <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Enhanced Toolbar */}
            <div className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Underline className="w-4 h-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6 mx-2" />
                  <Button variant="ghost" size="sm">
                    <AlignLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <AlignCenter className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <AlignRight className="w-4 h-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6 mx-2" />
                  <Button variant="ghost" size="sm">
                    <List className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Quote className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Link className="w-4 h-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-6 mx-2" />
                  <Button variant="ghost" size="sm">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startVoiceRecording}
                    className={voiceRecording ? 'text-red-500' : ''}
                  >
                    {voiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSpeechSynthesis}
                    className={speechSynthesis ? 'text-blue-500' : ''}
                  >
                    {speechSynthesis ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
                      {zoomLevel}%
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowLeftPanel(!showLeftPanel)}>
                    <PanelLeftClose className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowRightPanel(!showRightPanel)}>
                    <PanelRightClose className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 p-8 bg-gradient-to-br from-background via-background to-muted/20">
              <div className="max-w-4xl mx-auto">
                <div className="bg-card rounded-lg shadow-lg border border-border/50 min-h-[600px] p-8">
                  <textarea
                    ref={editorRef}
                    value={content}
                    onChange={handleContentChange}
                    className="w-full h-full min-h-[500px] resize-none border-none outline-none bg-transparent text-base leading-relaxed font-medium"
                    placeholder="Start writing your document..."
                    style={{ fontSize: `${zoomLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Stats Bar */}
            <div className="border-t border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 p-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{wordCount} words</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{readingTime} min read</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>Grade {gradeLevel}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>{plagiarismScore}% plagiarism</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Brain className="w-4 h-4" />
                    <span>{vocabularyScore}% vocabulary</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {suggestions.length} suggestions
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {comments.filter(c => !c.resolved).length} comments
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {writingGoal}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selectedLanguage}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Right Sidebar */}
          {showRightPanel && !focusMode && (
            <div className="w-96 border-l border-border bg-card/30 backdrop-blur supports-[backdrop-filter]:bg-card/30">
              <div className="p-4">
                <Tabs defaultValue="suggestions" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="suggestions">AI</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="suggestions" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">AI Suggestions</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {suggestions.length}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Filter className="w-3 h-3 mr-1" />
                        All
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs">Grammar</Button>
                      <Button variant="ghost" size="sm" className="text-xs">Style</Button>
                      <Button variant="ghost" size="sm" className="text-xs">Clarity</Button>
                    </div>
                    
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-3">
                        {suggestions.map((suggestion) => (
                          <Card key={suggestion.id} className={`p-3 ${getSuggestionColor(suggestion.type)}`}>
                            <div className="flex items-start space-x-2">
                              <div className="flex-shrink-0 mt-1">
                                {getSuggestionIcon(suggestion.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {suggestion.type}
                                  </Badge>
                                  <Badge 
                                    variant={suggestion.severity === 'error' ? 'destructive' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {suggestion.severity}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {suggestion.confidence}%
                                  </Badge>
                                </div>
                                <div className="text-sm font-medium mb-1">
                                  "{suggestion.text}"
                                </div>
                                <div className="text-sm text-muted-foreground mb-2">
                                  {suggestion.explanation}
                                </div>
                                <div className="text-sm font-medium text-green-600 mb-3">
                                  Suggestion: "{suggestion.suggestion}"
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => applySuggestion(suggestion)}
                                    className="text-xs"
                                  >
                                    Apply
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => dismissSuggestion(suggestion.id)}
                                    className="text-xs"
                                  >
                                    Dismiss
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-xs">
                                    <Lightbulb className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="space-y-4 mt-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Writing Analytics</span>
                    </div>
                    
                    <div className="space-y-4">
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Readability Score</span>
                          <span className="text-sm text-muted-foreground">85/100</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </Card>
                      
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Clarity Score</span>
                          <span className="text-sm text-muted-foreground">78/100</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </Card>
                      
                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Engagement Score</span>
                          <span className="text-sm text-muted-foreground">92/100</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </Card>

                      <Card className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Plagiarism Check</span>
                          <span className="text-sm text-muted-foreground">{plagiarismScore}%</span>
                        </div>
                        <Progress value={plagiarismScore} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {plagiarismScore < 5 ? 'Original content' : 'Some similarities found'}
                        </div>
                      </Card>

                      <Card className="p-4">
                        <CardHeader className="p-0 mb-3">
                          <CardTitle className="text-sm">Tone Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-2">
                          {Object.entries(toneAnalysis).map(([tone, score]) => (
                            <div key={tone} className="flex justify-between items-center text-sm">
                              <span className="capitalize">{tone}</span>
                              <div className="flex items-center space-x-2">
                                <Progress value={score} className="h-1 w-16" />
                                <span className="font-medium w-8">{score}%</span>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                      
                      <Card className="p-4">
                        <CardHeader className="p-0 mb-3">
                          <CardTitle className="text-sm">Writing Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Average sentence length</span>
                            <span className="font-medium">18 words</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Passive voice</span>
                            <span className="font-medium">12%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Adverb usage</span>
                            <span className="font-medium">3%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Reading level</span>
                            <span className="font-medium">Grade {gradeLevel}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Vocabulary diversity</span>
                            <span className="font-medium">{vocabularyScore}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="comments" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Comments</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {comments.filter(c => !c.resolved).length} active
                      </Badge>
                    </div>
                    
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <Card key={comment.id} className={`p-3 ${comment.resolved ? 'opacity-50' : ''}`}>
                            <div className="flex items-start space-x-2">
                              <div className="flex-shrink-0 mt-1">
                                <MessageSquare className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-sm font-medium">{comment.author}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {comment.timestamp.toLocaleTimeString()}
                                  </span>
                                  {comment.resolved && (
                                    <Badge variant="outline" className="text-xs">
                                      Resolved
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm mb-3">
                                  {comment.text}
                                </div>
                                {!comment.resolved && (
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      onClick={() => resolveComment(comment.id)}
                                      className="text-xs"
                                    >
                                      Resolve
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-xs">
                                      Reply
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                        
                        <Card className="p-3 border-dashed">
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Add a comment..."
                              className="text-sm"
                              rows={2}
                            />
                            <Button size="sm" className="text-xs">
                              Add Comment
                            </Button>
                          </div>
                        </Card>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}