import ollama
import asyncio
from typing import List, Dict, Any, Optional
from langchain.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.schema import BaseOutputParser
import json
import re
from app.models.suggestion import Suggestion, SuggestionType, SeverityLevel, TextPosition

class SuggestionOutputParser(BaseOutputParser):
    def parse(self, text: str) -> List[Dict[str, Any]]:
        try:
            # Try to parse as JSON first
            if text.strip().startswith('['):
                return json.loads(text)
            
            # Fallback to regex parsing
            suggestions = []
            lines = text.strip().split('\n')
            current_suggestion = {}
            
            for line in lines:
                line = line.strip()
                if line.startswith('Type:'):
                    if current_suggestion:
                        suggestions.append(current_suggestion)
                    current_suggestion = {'type': line.split(':', 1)[1].strip().lower()}
                elif line.startswith('Text:'):
                    current_suggestion['text'] = line.split(':', 1)[1].strip()
                elif line.startswith('Suggestion:'):
                    current_suggestion['suggestion'] = line.split(':', 1)[1].strip()
                elif line.startswith('Explanation:'):
                    current_suggestion['explanation'] = line.split(':', 1)[1].strip()
                elif line.startswith('Severity:'):
                    current_suggestion['severity'] = line.split(':', 1)[1].strip().lower()
                elif line.startswith('Confidence:'):
                    try:
                        current_suggestion['confidence'] = float(line.split(':', 1)[1].strip().replace('%', ''))
                    except:
                        current_suggestion['confidence'] = 80.0
            
            if current_suggestion:
                suggestions.append(current_suggestion)
                
            return suggestions
        except Exception as e:
            print(f"Error parsing suggestions: {e}")
            return []

class OllamaService:
    def __init__(self):
        self.client = None
        self.llm = None
        self.model_name = "llama3"
        self.base_url = "http://localhost:11434"
        
    async def initialize(self):
        """Initialize Ollama client and ensure model is available"""
        try:
            self.client = ollama.AsyncClient(host=self.base_url)
            self.llm = Ollama(
                model=self.model_name,
                base_url=self.base_url,
                temperature=0.3
            )
            
            # Check if model is available
            models = await self.client.list()
            model_names = [model['name'] for model in models['models']]
            
            if self.model_name not in model_names:
                print(f"Pulling {self.model_name} model...")
                await self.client.pull(self.model_name)
                
            print(f"Ollama service initialized with model: {self.model_name}")
            
        except Exception as e:
            print(f"Failed to initialize Ollama service: {e}")
            raise

    async def generate_suggestions(self, content: str, writing_goal: str = "professional", language: str = "en-US") -> List[Dict[str, Any]]:
        """Generate writing suggestions using Llama3"""
        
        prompt_template = PromptTemplate(
            input_variables=["content", "writing_goal", "language"],
            template="""
You are an expert writing assistant. Analyze the following text and provide specific suggestions for improvement.

Text to analyze: "{content}"
Writing goal: {writing_goal}
Language: {language}

Please provide suggestions in the following format for each issue found:

Type: [grammar|style|clarity|tone|vocabulary]
Text: [the problematic text]
Suggestion: [your suggested replacement]
Explanation: [brief explanation of why this is better]
Severity: [error|warning|info]
Confidence: [percentage from 0-100]

Focus on:
1. Grammar and spelling errors
2. Style improvements for {writing_goal} writing
3. Clarity and readability
4. Tone consistency
5. Vocabulary enhancement

Provide up to 10 most important suggestions.
"""
        )
        
        try:
            chain = LLMChain(llm=self.llm, prompt=prompt_template)
            response = await chain.arun(
                content=content[:2000],  # Limit content length
                writing_goal=writing_goal,
                language=language
            )
            
            parser = SuggestionOutputParser()
            suggestions = parser.parse(response)
            
            # Process and validate suggestions
            processed_suggestions = []
            for i, suggestion in enumerate(suggestions):
                if self._validate_suggestion(suggestion, content):
                    processed_suggestions.append(self._format_suggestion(suggestion, content, i))
            
            return processed_suggestions
            
        except Exception as e:
            print(f"Error generating suggestions: {e}")
            return []

    def _validate_suggestion(self, suggestion: Dict[str, Any], content: str) -> bool:
        """Validate that suggestion has required fields and text exists in content"""
        required_fields = ['type', 'text', 'suggestion', 'explanation']
        
        for field in required_fields:
            if field not in suggestion or not suggestion[field]:
                return False
        
        # Check if the suggested text exists in content
        if suggestion['text'] not in content:
            return False
            
        return True

    def _format_suggestion(self, suggestion: Dict[str, Any], content: str, index: int) -> Dict[str, Any]:
        """Format suggestion with proper types and position"""
        text = suggestion['text']
        start_pos = content.find(text)
        end_pos = start_pos + len(text) if start_pos != -1 else 0
        
        return {
            'id': f"suggestion_{index}",
            'type': suggestion.get('type', 'style'),
            'text': text,
            'suggestion': suggestion['suggestion'],
            'explanation': suggestion['explanation'],
            'position': {'start': start_pos, 'end': end_pos},
            'severity': suggestion.get('severity', 'info'),
            'confidence': suggestion.get('confidence', 80.0)
        }

    async def analyze_tone(self, content: str) -> Dict[str, float]:
        """Analyze the tone of the text"""
        prompt = f"""
Analyze the tone of the following text and provide scores (0-100) for each aspect:

Text: "{content[:1000]}"

Provide scores for:
- Formal (how formal vs casual)
- Confident (how confident vs uncertain)
- Optimistic (how positive vs negative)
- Analytical (how analytical vs emotional)

Format as: Formal: 75, Confident: 80, Optimistic: 65, Analytical: 90
"""
        
        try:
            response = await self.llm.agenerate([prompt])
            result = response.generations[0][0].text
            
            # Parse tone scores
            tone_scores = {}
            for line in result.split(','):
                if ':' in line:
                    key, value = line.split(':', 1)
                    try:
                        tone_scores[key.strip().lower()] = float(value.strip())
                    except:
                        pass
            
            return tone_scores
            
        except Exception as e:
            print(f"Error analyzing tone: {e}")
            return {'formal': 75, 'confident': 80, 'optimistic': 65, 'analytical': 90}

    async def check_plagiarism(self, content: str) -> float:
        """Basic plagiarism check (placeholder - would integrate with real service)"""
        # This is a placeholder - in production, you'd integrate with a real plagiarism detection service
        # For now, return a mock score based on content uniqueness
        
        common_phrases = [
            "the quick brown fox",
            "lorem ipsum",
            "to be or not to be",
            "it was the best of times"
        ]
        
        plagiarism_score = 0.0
        for phrase in common_phrases:
            if phrase.lower() in content.lower():
                plagiarism_score += 10.0
        
        return min(plagiarism_score, 100.0)

    async def improve_vocabulary(self, text: str, target_level: str = "advanced") -> str:
        """Suggest vocabulary improvements"""
        prompt = f"""
Improve the vocabulary in the following text to make it more {target_level}:

Original: "{text}"

Provide an improved version with more sophisticated vocabulary while maintaining the original meaning.
"""
        
        try:
            response = await self.llm.agenerate([prompt])
            return response.generations[0][0].text.strip()
        except Exception as e:
            print(f"Error improving vocabulary: {e}")
            return text