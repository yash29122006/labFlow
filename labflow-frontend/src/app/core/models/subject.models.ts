export interface SubjectRequest {
  name: string;
  code: string;
  department: string;
  academicYear: number;
  semester: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  department: string;
  academicYear: number;
  semester: number;
}
