// Generic API Response
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
  }
  
  // QuestionType Model
  export interface QuestionType {
    id: number;
    name: string;
    parentId?: number | null;
    parent?: QuestionType | null; // For nested relations
    children?: QuestionType[]; // For nested relations
  }
  
  // Subject Model
  export interface Subject {
    id: number;
    name: string;
    chapters?: Chapter[]; // Optional relation to chapters
  }
  
  // Chapter Model
  export interface Chapter {
    id: number;
    name: string;
    subjectId: number;
    subject?: Subject; // Optional relation to subject
    topics?: Topic[]; // Optional relation to topics
  }
  
  // Topic Model
  export interface Topic {
    id: number;
    name: string;
    chapterId: number;
    chapter?: Chapter; // Optional relation to chapter
  }
  
  // Question Model
  export interface Question {
    id: number;
    questionTypeId: number;
    subjectId: number;
    chapterId: number;
    topicId: number;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
    hint?: string; // Optional hint
    questionType?: QuestionType; // Optional relation to QuestionType
    subject?: Subject; // Optional relation to Subject
    chapter?: Chapter; // Optional relation to Chapter
    topic?: Topic; // Optional relation to Topic
  }
  
  // Test Model
  export interface Test {
    id: number;
    questionId: number;
    correctAnswer: number;
    wrongAnswer: number;
    unAnswered: number;
    accuracy: number;
    totalTime: string;
    overallScore: number;
    question?: Question; // Optional relation to Question
  }
  