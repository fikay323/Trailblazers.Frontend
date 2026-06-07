export enum ExamSubject {
  English = 1,
  Mathematics = 2,
  Biology = 3,
  Chemistry = 4,
  Physics = 5,
  Geography = 6,
  CivicEducation = 7,
  Government = 8,
  LiteratureInEnglish = 9,
  Economics = 10,
  Commerce = 11,
  ChristianReligiousStudies = 12,
  IslamicReligiousStudies = 13,
  History = 14
}

export const ExamSubjectLabels: Record<ExamSubject, string> = {
  [ExamSubject.English]: "English",
  [ExamSubject.Mathematics]: "Mathematics",
  [ExamSubject.Biology]: "Biology",
  [ExamSubject.Chemistry]: "Chemistry",
  [ExamSubject.Physics]: "Physics",
  [ExamSubject.Geography]: "Geography",
  [ExamSubject.CivicEducation]: "Civic Education",
  [ExamSubject.Government]: "Government",
  [ExamSubject.LiteratureInEnglish]: "Literature in English",
  [ExamSubject.Economics]: "Economics",
  [ExamSubject.Commerce]: "Commerce",
  [ExamSubject.ChristianReligiousStudies]: "Christian Religious Studies",
  [ExamSubject.IslamicReligiousStudies]: "Islamic Religious Studies",
  [ExamSubject.History]: "History",
};
