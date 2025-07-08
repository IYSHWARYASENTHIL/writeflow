import textstat
import re
from typing import Dict, Any, List
from collections import Counter
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
from app.models.document import DocumentAnalytics

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

class AnalyticsService:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
    
    def analyze_document(self, content: str, document_id: str) -> DocumentAnalytics:
        """Comprehensive document analysis"""
        
        # Basic metrics
        word_count = len(content.split())
        sentence_count = len(sent_tokenize(content))
        
        # Readability scores
        readability_score = self._calculate_readability(content)
        clarity_score = self._calculate_clarity(content)
        engagement_score = self._calculate_engagement(content)
        vocabulary_score = self._calculate_vocabulary_diversity(content)
        grade_level = textstat.flesch_kincaid_grade(content)
        
        # Writing statistics
        writing_stats = self._calculate_writing_stats(content)
        
        # Tone analysis (placeholder - would use AI service)
        tone_analysis = {
            'formal': 75.0,
            'confident': 80.0,
            'optimistic': 65.0,
            'analytical': 90.0
        }
        
        return DocumentAnalytics(
            document_id=document_id,
            readability_score=readability_score,
            clarity_score=clarity_score,
            engagement_score=engagement_score,
            plagiarism_score=2.0,  # Placeholder
            vocabulary_score=vocabulary_score,
            grade_level=max(6, min(16, int(grade_level))),
            tone_analysis=tone_analysis,
            writing_stats=writing_stats
        )
    
    def _calculate_readability(self, content: str) -> float:
        """Calculate readability score using multiple metrics"""
        try:
            flesch_score = textstat.flesch_reading_ease(content)
            # Convert to 0-100 scale where higher is better
            return max(0, min(100, flesch_score))
        except:
            return 75.0
    
    def _calculate_clarity(self, content: str) -> float:
        """Calculate clarity score based on sentence structure and word choice"""
        sentences = sent_tokenize(content)
        if not sentences:
            return 0.0
        
        # Average sentence length
        avg_sentence_length = sum(len(sentence.split()) for sentence in sentences) / len(sentences)
        
        # Penalty for very long sentences
        length_score = max(0, 100 - (avg_sentence_length - 15) * 2)
        
        # Count complex words (3+ syllables)
        words = word_tokenize(content.lower())
        complex_words = sum(1 for word in words if textstat.syllable_count(word) >= 3)
        complexity_ratio = complex_words / len(words) if words else 0
        complexity_score = max(0, 100 - complexity_ratio * 200)
        
        return (length_score + complexity_score) / 2
    
    def _calculate_engagement(self, content: str) -> float:
        """Calculate engagement score based on various factors"""
        score = 50.0  # Base score
        
        # Check for questions
        question_count = content.count('?')
        score += min(question_count * 5, 20)
        
        # Check for active voice indicators
        active_indicators = ['we', 'you', 'I', 'they']
        active_count = sum(content.lower().count(word) for word in active_indicators)
        score += min(active_count * 2, 15)
        
        # Check for transition words
        transitions = ['however', 'therefore', 'moreover', 'furthermore', 'additionally']
        transition_count = sum(content.lower().count(word) for word in transitions)
        score += min(transition_count * 3, 15)
        
        return min(100, score)
    
    def _calculate_vocabulary_diversity(self, content: str) -> float:
        """Calculate vocabulary diversity using type-token ratio"""
        words = [word.lower() for word in word_tokenize(content) if word.isalpha()]
        if not words:
            return 0.0
        
        unique_words = set(words)
        diversity_ratio = len(unique_words) / len(words)
        
        # Convert to 0-100 scale
        return min(100, diversity_ratio * 200)
    
    def _calculate_writing_stats(self, content: str) -> Dict[str, Any]:
        """Calculate detailed writing statistics"""
        sentences = sent_tokenize(content)
        words = word_tokenize(content)
        
        # Average sentence length
        avg_sentence_length = len(words) / len(sentences) if sentences else 0
        
        # Passive voice detection (simplified)
        passive_indicators = ['was', 'were', 'been', 'being', 'is', 'are', 'am']
        passive_count = sum(1 for word in words if word.lower() in passive_indicators)
        passive_percentage = (passive_count / len(words)) * 100 if words else 0
        
        # Adverb usage (words ending in -ly)
        adverbs = [word for word in words if word.lower().endswith('ly') and len(word) > 3]
        adverb_percentage = (len(adverbs) / len(words)) * 100 if words else 0
        
        # Most common words (excluding stop words)
        content_words = [word.lower() for word in words if word.lower() not in self.stop_words and word.isalpha()]
        word_freq = Counter(content_words)
        
        return {
            'average_sentence_length': round(avg_sentence_length, 1),
            'passive_voice_percentage': round(passive_percentage, 1),
            'adverb_percentage': round(adverb_percentage, 1),
            'total_sentences': len(sentences),
            'total_words': len(words),
            'unique_words': len(set(content_words)),
            'most_common_words': word_freq.most_common(10)
        }
    
    def calculate_reading_time(self, content: str, wpm: int = 200) -> int:
        """Calculate estimated reading time in minutes"""
        word_count = len(content.split())
        return max(1, round(word_count / wpm))
    
    def extract_keywords(self, content: str, limit: int = 10) -> List[str]:
        """Extract key terms from content"""
        words = [word.lower() for word in word_tokenize(content) 
                if word.isalpha() and word.lower() not in self.stop_words and len(word) > 3]
        
        word_freq = Counter(words)
        return [word for word, _ in word_freq.most_common(limit)]