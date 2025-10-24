'use client';

import { useState } from 'react';

interface Tag {
  type: string;
  value: string;
}

interface UploadedFile {
  id: number;
  name: string;
  size: number;
  type: string;
  file: File;
}

interface Template {
  title: string;
  instruction: string;
  context: string;
  inputExample: string;
  outputFormat: string;
  constraints: string;
}

export default function CreatePromptPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instruction, setInstruction] = useState('');
  const [context, setContext] = useState('');
  const [inputExample, setInputExample] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [collection, setCollection] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagType, setTagType] = useState('category');
  const [tagValue, setTagValue] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showTestModal, setShowTestModal] = useState(false);
  const [model, setModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [testResults, setTestResults] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const templates: Record<string, Template> = {
    essay: {
      title: 'Essay Writing Assistant',
      instruction: 'Help students write well-structured academic essays with clear thesis statements, supporting arguments, and proper conclusions.',
      context: 'Academic writing context with focus on critical thinking and argumentation.',
      inputExample: 'Topic: Climate change effects on agriculture',
      outputFormat: 'Structured essay with introduction, body paragraphs, and conclusion',
      constraints: 'Minimum 500 words, academic tone, cite sources when applicable'
    },
    math: {
      title: 'Math Problem Solver',
      instruction: 'Provide step-by-step solutions to mathematical problems, explaining each step clearly.',
      context: 'Educational mathematics with focus on understanding concepts.',
      inputExample: 'Solve: 2x + 5 = 13',
      outputFormat: 'Step-by-step solution with explanations',
      constraints: 'Show all work, explain reasoning for each step'
    },
    code: {
      title: 'Code Review Assistant',
      instruction: 'Review code for best practices, bugs, and improvements. Provide constructive feedback.',
      context: 'Programming education and code quality improvement.',
      inputExample: 'function calculateSum(a, b) { return a + b; }',
      outputFormat: 'Detailed review with suggestions and improved code',
      constraints: 'Focus on readability, efficiency, and best practices'
    },
    language: {
      title: 'Language Practice Conversation',
      instruction: 'Engage in natural conversation to help students practice language skills.',
      context: 'Language learning environment with supportive feedback.',
      inputExample: 'Student response in target language',
      outputFormat: 'Natural conversation with gentle corrections',
      constraints: 'Appropriate difficulty level, encouraging tone'
    },
    creative: {
      title: 'Creative Writing Assistant',
      instruction: 'Help students develop creative writing skills through engaging prompts and feedback.',
      context: 'Creative writing education with focus on imagination and storytelling.',
      inputExample: 'Write a short story about a time traveler',
      outputFormat: 'Creative narrative with character development',
      constraints: 'Encourage creativity, provide constructive feedback'
    },
    science: {
      title: 'Science Explanation Assistant',
      instruction: 'Explain scientific concepts in clear, accessible language for students.',
      context: 'Science education with focus on understanding complex concepts.',
      inputExample: 'Explain photosynthesis in simple terms',
      outputFormat: 'Clear explanation with examples and analogies',
      constraints: 'Use appropriate terminology, include visual descriptions'
    },
    history: {
      title: 'History Analysis Assistant',
      instruction: 'Help students analyze historical events and their significance.',
      context: 'History education with focus on critical analysis and context.',
      inputExample: 'Analyze the causes of World War I',
      outputFormat: 'Structured analysis with multiple perspectives',
      constraints: 'Cite historical evidence, consider different viewpoints'
    },
    business: {
      title: 'Business Case Study Assistant',
      instruction: 'Guide students through business problem analysis and solution development.',
      context: 'Business education with focus on practical problem-solving.',
      inputExample: 'Analyze a company\'s declining sales',
      outputFormat: 'Comprehensive business analysis with recommendations',
      constraints: 'Use business frameworks, provide actionable insights'
    }
  };

  const addTag = () => {
    if (tagValue.trim() && !tags.some(tag => tag.type === tagType && tag.value === tagValue.trim())) {
      setTags([...tags, { type: tagType, value: tagValue.trim() }]);
      setTagValue('');
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setUploadedFiles(prev => [...prev, {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      }]);
    });
  };

  const removeFile = (id: number) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== id));
  };

  const applyTemplate = (templateType: string) => {
    const template = templates[templateType];
    if (template) {
      setTitle(template.title);
      setInstruction(template.instruction);
      setContext(template.context);
      setInputExample(template.inputExample);
      setOutputFormat(template.outputFormat);
      setConstraints(template.constraints);
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving prompt...');
  };

  const handleTest = () => {
    // TODO: Implement test functionality
    console.log('Testing prompt...');
    setTestResults('Test completed successfully');
  };

  const generatePromptReview = () => {
    const review = [];
    
    if (instruction) {
      review.push(`**Instruction:**\n${instruction}`);
    }
    
    if (context) {
      review.push(`**Context:**\n${context}`);
    }
    
    if (inputExample) {
      review.push(`**Input Example:**\n${inputExample}`);
    }
    
    if (outputFormat) {
      review.push(`**Output Format:**\n${outputFormat}`);
    }
    
    if (constraints) {
      review.push(`**Constraints:**\n${constraints}`);
    }
    
    return review.join('\n\n');
  };

  const handleOptimize = () => {
    setIsOptimizing(true);
    // TODO: Implement AI optimization
    setTimeout(() => {
      setIsOptimizing(false);
    }, 2000);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/90 border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm">
              <a href="#" className="text-gray-500 hover:text-gray-700">Dashboard</a>
              <span className="text-gray-400">/</span>
              <a href="#" className="text-gray-500 hover:text-gray-700">Prompts</a>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Create New</span>
            </nav>
            
            {/* Teacher Info & Actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%233b82f6'/%3E%3Ctext x='16' y='21' text-anchor='middle' fill='white' font-family='Arial' font-size='14' font-weight='bold'%3EJS%3C/text%3E%3C/svg%3E" alt="Teacher Avatar" className="w-8 h-8 rounded-full" />
                <span className="text-sm font-medium text-gray-700">Lord Tri Nguyen</span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save Draft
                </button>
                <button 
                  onClick={() => setShowTestModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Run Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <main className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Prompt</h1>
              
              <form className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input 
                    type="text" 
                    id="title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={255} 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200" 
                    placeholder="Enter prompt title"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 255 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    id="description" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200" 
                    placeholder="Brief description of what this prompt does"
                  />
                </div>

                {/* Instruction */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="instruction" className="block text-sm font-medium text-gray-700">Instruction *</label>
                    <button 
                      type="button" 
                      onClick={handleOptimize}
                      disabled={isOptimizing}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 border border-purple-200 disabled:opacity-50"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                      {isOptimizing ? 'Analyzing...' : 'Optimize'}
                    </button>
                  </div>
                  <textarea 
                    id="instruction" 
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    rows={4} 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200" 
                    placeholder="Detailed instructions for the AI model"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 20 characters required</p>
                </div>

                {/* Context */}
                <div>
                  <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">Context</label>
                  <textarea 
                    id="context" 
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={3} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200" 
                    placeholder="Additional context or background information"
                  />
                </div>

                {/* Input Example */}
                <div>
                  <label htmlFor="inputExample" className="block text-sm font-medium text-gray-700 mb-2">Input Example</label>
                  <textarea 
                    id="inputExample" 
                    value={inputExample}
                    onChange={(e) => setInputExample(e.target.value)}
                    rows={3} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200" 
                    placeholder="Example of expected input"
                  />
                </div>

                {/* Output Format */}
                <div>
                  <label htmlFor="outputFormat" className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                  <textarea 
                    id="outputFormat" 
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    rows={3} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200" 
                    placeholder="Specify the desired output format"
                  />
                </div>

                {/* Constraints */}
                <div>
                  <label htmlFor="constraints" className="block text-sm font-medium text-gray-700 mb-2">Constraints</label>
                  <textarea 
                    id="constraints" 
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    rows={3} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200" 
                    placeholder="Any limitations or constraints"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 min-h-[2rem]">
                      {tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <span className="text-blue-600 mr-1">{tag.type}:</span>
                          {tag.value}
                          <button 
                            type="button" 
                            onClick={() => removeTag(index)} 
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <select 
                        value={tagType}
                        onChange={(e) => setTagType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                      >
                        <option value="category">Category</option>
                        <option value="subject">Subject</option>
                        <option value="difficulty">Difficulty</option>
                        <option value="language">Language</option>
                      </select>
                      <input 
                        type="text" 
                        value={tagValue}
                        onChange={(e) => setTagValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Tag value" 
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                      />
                      <button 
                        type="button" 
                        onClick={addTag}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>
                </div>

                {/* Visibility & Collection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Visibility & Collection</label>
                  <div className="space-y-3">
                    <div className="flex space-x-6">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="visibility" 
                          value="private" 
                          checked={visibility === 'private'}
                          onChange={(e) => setVisibility(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Private</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="visibility" 
                          value="group" 
                          checked={visibility === 'group'}
                          onChange={(e) => setVisibility(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Group</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="visibility" 
                          value="public" 
                          checked={visibility === 'public'}
                          onChange={(e) => setVisibility(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Public</span>
                      </label>
                    </div>
                    <select 
                      value={collection}
                      onChange={(e) => setCollection(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                    >
                      <option value="">Auto-create private collection</option>
                      <option value="math-prompts">Math Prompts</option>
                      <option value="writing-exercises">Writing Exercises</option>
                      <option value="science-labs">Science Labs</option>
                    </select>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input 
                      type="file" 
                      multiple 
                      accept=".pdf,.doc,.docx,.txt,.jpg,.png" 
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      className="hidden"
                      id="fileInput"
                    />
                    <label htmlFor="fileInput" className="cursor-pointer">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, DOC, TXT, JPG, PNG up to 10MB</p>
                    </label>
                  </div>
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeFile(file.id)} 
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Suggestions */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                      <span className="text-sm font-medium text-purple-700">AI Optimization</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleOptimize}
                      className="px-3 py-1 text-xs font-medium text-purple-600 bg-white rounded-md hover:bg-purple-50 border border-purple-200"
                    >
                      Optimize Prompt
                    </button>
                  </div>
                  <p className="text-xs text-purple-600 mt-2">Get AI suggestions to improve your prompt's effectiveness</p>
                </div>
              </form>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Template Chooser */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[calc(100vh-200px)] flex flex-col sticky top-24 transition-all duration-500 ease-in-out hover:shadow-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Templates</h3>
                <p className="text-sm text-gray-500 mt-1">Choose a template to get started</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
                {Object.entries(templates).map(([key, template]) => (
                  <div key={key} className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-md hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-out group">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{template.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-200">
                      {key === 'essay' && 'Structure for academic essays'}
                      {key === 'math' && 'Step-by-step solutions'}
                      {key === 'code' && 'Programming feedback'}
                      {key === 'language' && 'Conversation scenarios'}
                      {key === 'creative' && 'Story and narrative prompts'}
                      {key === 'science' && 'Scientific concept explanations'}
                      {key === 'history' && 'Historical event analysis'}
                      {key === 'business' && 'Business problem analysis'}
                    </p>
                    <button 
                      onClick={() => applyTemplate(key)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-700 hover:font-medium transition-all duration-200 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 hover:shadow-md transition-all duration-300 ease-out">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 hover:text-blue-700 transition-colors duration-200">💡 Quick Tips</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="hover:text-blue-600 transition-colors duration-200 cursor-default">• Be specific in your instructions</li>
                  <li className="hover:text-blue-600 transition-colors duration-200 cursor-default">• Include clear examples</li>
                  <li className="hover:text-blue-600 transition-colors duration-200 cursor-default">• Set appropriate constraints</li>
                  <li className="hover:text-blue-600 transition-colors duration-200 cursor-default">• Test with different inputs</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Test Prompt</h2>
                <button 
                  onClick={() => setShowTestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                <div className="space-y-6">
                  {/* Prompt Review Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Prompt Review</h3>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto border border-gray-200">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                        {generatePromptReview() || 'No prompt content to review yet. Fill in the instruction, context, input example, output format, and constraints fields to see the complete prompt review.'}
                      </pre>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">This shows how your complete prompt will be structured</p>
                  </div>

                  {/* Test Settings and Results */}
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                    {/* Results - Takes 4/6 of the space (swapped to left) */}
                    <div className="lg:col-span-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Results</h3>
                      <div className="bg-gray-50 rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto border border-gray-200">
                        {testResults ? (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              <span className="text-sm font-medium text-green-700">Test completed successfully</span>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">AI Response:</h4>
                              <p className="text-sm text-gray-700">{testResults}</p>
                            </div>
                            <div className="text-xs text-gray-500">
                              <p>Tokens used: 156 / {maxTokens}</p>
                              <p>Response time: 2.3s</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center">Run a test to see results here</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Settings - Takes 2/6 of the space (swapped to right, smaller) */}
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Test Settings</h3>
                      <div className="space-y-3">
                        <div>
                          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                          <select 
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                          >
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            <option value="claude-3">Claude 3</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                            Temp: {temperature}
                          </label>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.1" 
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                          <input 
                            type="number" 
                            value={maxTokens}
                            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                            min="1" 
                            max="4000" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 hover:border-blue-400 hover:shadow-sm transition-all duration-200"
                          />
                        </div>
                        <button 
                          onClick={handleTest}
                          className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          Run Test
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
