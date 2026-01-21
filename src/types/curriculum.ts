export interface DetailLessonResponse {
    id: string;
    chapterId: string;
    lessonNumber: number;
    name: string;
    description: string;
    content: string;
}

export interface PromptLessonResponse {
    id: string;
    userId: string;
    collectionId: string;
    title: string;
    description: string;
    instruction: string;
    context: string;
    inputExample: string;
    outputFormat: string;
    constraints: string;
    visibility: string;
    avgRating: number;
    lessonId: string;
}

export interface SubjectDto {
    id: string;
    name: string;
    description: string;
}

export interface GradeLevelDto {
    id: string;
    level: number;
    description: string;
}

export interface LessonDto {
    id: string;
    chapterId: string;
    lessonNumber: number;
    name: string;
    description: string;
    content: string;
}

export interface ChapterDto {
    id: string;
    semesterId: string;
    chapterNumber: number;
    name: string;
    description: string;
    listOfLesson: LessonDto[];
}

export interface SemesterDto {
    id: string;
    semesterNumber: number;
    name: string;
    listOfChapter: ChapterDto[];
}

export interface CurriculumResponse {
    subjects: SubjectDto[];
    gradeLevels: GradeLevelDto[];
    semesters: SemesterDto[];
}

export interface ResponseDto<T> {
    data: T | null;
    error: {
        code: string;
        message: string[];
        status: string;
    } | null;
}
