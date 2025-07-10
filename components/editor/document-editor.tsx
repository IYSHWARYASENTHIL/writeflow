"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Download, 
  Share2, 
  Eye, 
  BarChart3, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Clock,
  Brain,
  Shield,
  Sparkles,
  Loader2,
  Zap
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useAuth } from '@/lib/auth';

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
}

interface Suggestion {
  id: string;
  type: string;
  text: string;
  suggestion: string;
  explanation: string;
  position: { start: number; end: number };
  severity: string;
  confidence: number;
}

interface DocumentEditorProps {
  document: Document;
  onDocumentUpdate: (document: Document) => void;
}

export function DocumentEditor({ document, onDocumentUpdate }: DocumentEditorProps) {
  const [content, setContent] = useState(document.content);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (content !== document.content && content.trim()) {
        handleSave();
      }
    }, 2000);

    return () => clearTimeout(autoSave);
  }, [content, document.content]);

  // Calculate basic stats
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200);

  const handleSave = async () => {
    if (!user || isSaving) return;

    setIsSaving(true);
    try {
      const response = await apiClient.updateDocument(document.id, {
        content,
        word_count: wordCount,
        reading_time: readingTime,
      });

      if (response.data) {
        onDocumentUpdate(response.data);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!user || isGeneratingSuggestions || !content.trim()) return;

    setIsGeneratingSuggestions(true);
    try {
      const response = await apiClient.generateSuggestions({
        document_id: document.id,
        content,
        language: document.language,
        writing_goal: document.writing_goal,
      });

      if (response.data) {
        setSuggestions(response.data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!user || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const response = await apiClient.getDocumentAnalytics(document.id);
      if (response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to analyze document:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = async (suggestion: Suggestion) => {
    try {
      const newContent = content.slice(0, suggestion.position.start) + 
                        suggestion.suggestion + 
                        content.slice(suggestion.position.end);
      setContent(newContent);
      
      await apiClient.applySuggestion(suggestion.id);
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
    }
  };

  const dismissSuggestion = async (suggestionId: string) => {
    try {
      await apiClient.dismissSuggestion(suggestionId);
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (error) {
      console.error('Failed to dismiss suggestion:', error);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'grammar': return <AlertCircle className="w-4 h-4" />;
      case 'style': return <Sparkles className="w-4 h-4" />;
      case 'clarity': return <Lightbulb className="w-4 h-4" />;
      case 'tone': return <Brain className="w-4 h-4" />;
      case 'vocabulary': return <BookOpen className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'border-red-200 bg-red-50';
      case 'style': return 'border-blue-200 bg-blue-50';
      case 'clarity': return 'border-green-200 bg-green-50';
      case 'tone': return 'border-purple-200 bg-purple-50';
      case 'vocabulary': return 'border-orange-200 bg-orange-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-border bg-card/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || content === document.content}
                size="sm"
                variant="outline"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
              <Button
                onClick={handleGenerateSuggestions}
                disabled={isGeneratingSuggestions || !content.trim()}
                size="sm"
                variant="outline"
              >
                {isGeneratingSuggestions ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                AI Suggestions
              </Button>
              <Button
                onClick={handleAnalyzeDocument}
                disabled={isAnalyzing}
                size="sm"
                variant="outline"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4 mr-2" />
                )}
                Analyze
              </Button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {lastSaved && (
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              )}
              <Badge variant="outline">{wordCount} words</Badge>
              <Badge variant="outline">{readingTime} min read</Badge>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-6">
          <Card className="h-full p-6">
            <Textarea
              ref={editorRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your document..."
              className="w-full h-full resize-none border-none outline-none text-base leading-relaxed"
            />
          </Card>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-border bg-card/50 p-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>{wordCount} words</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min read</span>
              </div>
              {analytics && (
                <>
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>Grade {analytics.grade_level}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>{analytics.plagiarism_score}% plagiarism</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{suggestions.length} suggestions</Badge>
              <Badge variant="outline">{document.writing_goal}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Suggestions & Analytics */}
      <div className="w-80 border-l border-border bg-card/30">
        <div className="p-4 space-y-4">
          {/* AI Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">AI Suggestions</span>
              </div>
              <Badge variant="secondary">{suggestions.length}</Badge>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
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
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {suggestions.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No suggestions yet</p>
                  <p className="text-xs">Click "AI Suggestions" to analyze your text</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Analytics */}
          {analytics && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Analytics</span>
              </div>
              
              <div className="space-y-3">
                <Card className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Readability</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(analytics.readability_score)}/100
                    </span>
                  </div>
                  <Progress value={analytics.readability_score} className="h-2" />
                </Card>
                
                <Card className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Clarity</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(analytics.clarity_score)}/100
                    </span>
                  </div>
                  <Progress value={analytics.clarity_score} className="h-2" />
                </Card>
                
                <Card className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Engagement</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(analytics.engagement_score)}/100
                    </span>
                  </div>
                  <Progress value={analytics.engagement_score} className="h-2" />
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}