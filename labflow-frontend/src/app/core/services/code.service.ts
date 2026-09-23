import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CodeExecutionRequest, Judge0Result } from '../models/submission.models';

export interface SupportedLanguage {
  id: number;
  name: string;
  defaultCode: string;
  extension: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    id: 71,
    name: 'Python (3.8.1)',
    extension: 'py',
    defaultCode: '# Write your Python code here\ndef solve():\n    print("Hello from LabFlow!")\n\nif __name__ == "__main__":\n    solve()\n'
  },
  {
    id: 62,
    name: 'Java (OpenJDK 13.0.1)',
    extension: 'java',
    defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from LabFlow!");\n    }\n}\n'
  },
  {
    id: 54,
    name: 'C++ (GCC 9.2.0)',
    extension: 'cpp',
    defaultCode: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from LabFlow!" << std::endl;\n    return 0;\n}\n'
  },
  {
    id: 50,
    name: 'C (GCC 9.2.0)',
    extension: 'c',
    defaultCode: '#include <stdio.h>\n\nint main() {\n    printf("Hello from LabFlow!\\n");\n    return 0;\n}\n'
  },
  {
    id: 63,
    name: 'JavaScript (Node.js 12.14.0)',
    extension: 'js',
    defaultCode: 'console.log("Hello from LabFlow!");\n'
  },
  {
    id: 60,
    name: 'Go (1.13.5)',
    extension: 'go',
    defaultCode: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from LabFlow!")\n}\n'
  },
  {
    id: 51,
    name: 'C# (Mono 6.6.0.161)',
    extension: 'cs',
    defaultCode: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from LabFlow!");\n    }\n}\n'
  },
  {
    id: 72,
    name: 'Ruby (2.7.0)',
    extension: 'rb',
    defaultCode: 'puts "Hello from LabFlow!"\n'
  },
  {
    id: 68,
    name: 'PHP (7.4.1)',
    extension: 'php',
    defaultCode: '<?php\necho "Hello from LabFlow!\\n";\n'
  },
  {
    id: 78,
    name: 'Kotlin (1.3.70)',
    extension: 'kt',
    defaultCode: 'fun main() {\n    println("Hello from LabFlow!")\n}\n'
  }
];

@Injectable({
  providedIn: 'root'
})
export class CodeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/code/execute`;

  executeCode(req: CodeExecutionRequest): Observable<Judge0Result> {
    return this.http.post<Judge0Result>(this.baseUrl, req);
  }
}
