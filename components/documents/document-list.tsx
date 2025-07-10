"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Search, 
  Star, 
  Copy, 
  Trash2, 
  FileText,
  Clock,
  BookOpen,
  Loader2
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
  updated_at: string;
  created_at: string;
  status: string;
}

interface DocumentListProps {
  onDocumentSelect: (document: Document) => void;
  selectedDocumentId?: string;
}

export function DocumentList({ onDocumentSelect, selectedDocumentId }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await apiClient.getDocuments({ limit: 50 });
      if (response.data) {
        setDocuments(response.data);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewDocument = async () => {
    if (!user || isCreating) return;

    setIsCreating(true);
    try {
      const response = await apiClient.createDocument({
        title: 'Untitled Document',
        content: '',
        tags: [],
        language: 'en-US',
        writing_goal: 'professional',
      });

      if (response.data) {
        const newDoc = response.data;
        setDocuments(prev => [newDoc, ...prev]);
        onDocumentSelect(newDoc);
      }
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const duplicateDocument = async (doc: Document) => {
    try {
      const response = await apiClient.duplicateDocument(doc.id);
      if (response.data) {
        setDocuments(prev => [response.data, ...prev]);
      }
    } catch (error) {
      console.error('Failed to duplicate document:', error);
    }
  };

  const deleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await apiClient.deleteDocument(docId);
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!user) {
    return (
      <div className="w-80 border-r border-border bg-card/30 p-4">
        <div className="text-center text-muted-foreground">
          Please sign in to view your documents
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-border bg-card/30">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Button 
            onClick={createNewDocument} 
            disabled={isCreating}
            className="flex-1" 
            size="sm"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            New Document
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

        <ScrollArea className="h-[calc(100vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className={`p-3 cursor-pointer transition-colors group hover:bg-muted/50 ${
                    selectedDocumentId === doc.id
                      ? 'bg-primary/10 border-primary/20'
                      : ''
                  }`}
                  onClick={() => onDocumentSelect(doc)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="font-medium text-sm truncate">{doc.title}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="w-3 h-3" />
                            <span>{doc.word_count} words</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(doc.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                      {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {doc.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {doc.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{doc.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {doc.content.slice(0, 100)}...
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateDocument(doc);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocument(doc.id);
                        }}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {filteredDocuments.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchTerm ? 'No documents found' : 'No documents yet'}
                  </p>
                  <p className="text-xs">
                    {searchTerm ? 'Try a different search term' : 'Create your first document to get started'}
                  </p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}