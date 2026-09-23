import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#F5F7FB] flex flex-col font-sans text-[#0B1F44]">
      <!-- Top Navigation -->
      <nav class="h-16 bg-white border-b border-[#E5EAF2] sticky top-0 z-40 px-6 md:px-12 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <svg class="w-7 h-7 text-[#2563EB]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/>
            <path d="M8.5 2h7"/>
            <path d="M7 16h10"/>
          </svg>
          <span class="font-bold text-xl tracking-tight text-[#2563EB]">LabFlow</span>
        </div>

        <div class="hidden md:flex items-center gap-8 text-sm font-medium text-[#475569]">
          <a href="#home" class="hover:text-[#2563EB] transition-colors">Home</a>
          <a href="#features" class="hover:text-[#2563EB] transition-colors">Features</a>
          <a href="#about" class="hover:text-[#2563EB] transition-colors">About</a>
        </div>

        <div class="flex items-center gap-3">
          <a routerLink="/login/student" class="btn btn-primary text-xs font-semibold px-5">
            Get Started
          </a>
        </div>
      </nav>

      <!-- Hero Section (Screen 1) -->
      <section id="home" class="py-12 md:py-20 px-6 md:px-12 max-w-7xl mx-auto flex-1 flex items-center">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          <!-- Left Column -->
          <div class="lg:col-span-6 space-y-6 text-left">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF1FF] text-[#2563EB] text-xs font-semibold tracking-wide">
              <span>🚀</span> LabFlow Academic Platform
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0B1F44] tracking-tight leading-[1.15]">
              Your Coding <br/>
              <span class="text-[#2563EB]">Lab Companion</span>
            </h1>

            <p class="text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl">
              Manage subjects, assignments, quizzes and submissions — all in one place. Built specifically for students, faculty, and academic administrators.
            </p>

            <div class="flex flex-wrap items-center gap-4 pt-2">
              <a routerLink="/login/student" class="btn btn-primary px-7 py-3 text-sm font-semibold shadow-md hover:shadow-lg">
                Get Started
              </a>
              <a href="#about" class="btn btn-outline px-6 py-3 text-sm font-semibold">
                About Us
              </a>
            </div>

            <!-- Quick stats bar -->
            <div class="pt-6 grid grid-cols-3 gap-6 border-t border-[#E5EAF2]">
              <div>
                <div class="text-2xl font-bold text-[#0B1F44]">100%</div>
                <div class="text-xs text-[#94A3B8]">Real-time Evaluation</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-[#0B1F44]">5+</div>
                <div class="text-xs text-[#94A3B8]">Languages Supported</div>
              </div>
              <div>
                <div class="text-2xl font-bold text-[#0B1F44]">3</div>
                <div class="text-xs text-[#94A3B8]">Integrated Roles</div>
              </div>
            </div>
          </div>

          <!-- Right Column: Mockup Illustration with 4 Floating Chips -->
          <div class="lg:col-span-6 relative flex justify-center items-center">
            <!-- Background Glow -->
            <div class="absolute w-80 h-80 bg-blue-200/50 rounded-full blur-3xl -z-10"></div>

            <div class="relative w-full max-w-[480px] bg-white rounded-2xl border border-[#E5EAF2] p-6 shadow-xl">
              <!-- Mock Laptop Illustration -->
              <div class="bg-[#0B1F44] rounded-xl p-4 shadow-inner border border-[#1A3160]">
                <div class="flex items-center gap-1.5 mb-3">
                  <span class="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  <span class="text-[10px] text-[#94A3B8] font-mono ml-2">LabFlow Workspace</span>
                </div>
                <div class="font-mono text-xs text-blue-300 space-y-1 py-4 px-2">
                  <div class="text-pink-400">// Submit and verify your code solution</div>
                  <div><span class="text-purple-400">public class</span> <span class="text-yellow-300">Solution</span> &#123;</div>
                  <div class="pl-4"><span class="text-purple-400">public static void</span> <span class="text-blue-300">main</span>(String[] args) &#123;</div>
                  <div class="pl-8 text-green-300">System.out.println("LabFlow Ready!");</div>
                  <div class="pl-4">&#125;</div>
                  <div>&#125;</div>
                </div>
              </div>

              <!-- Floating Chips (Learn, Practice, Evaluate, Submit) -->
              <!-- Learn Chip (Purple) -->
              <div class="absolute -top-3 -left-3 bg-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 animate-bounce" style="animation-duration: 3s;">
                <span>📖</span> Learn
              </div>

              <!-- Practice Chip (Teal) -->
              <div class="absolute -bottom-3 -left-3 bg-teal-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                <span>💻</span> Practice
              </div>

              <!-- Evaluate Chip (Pink) -->
              <div class="absolute -top-3 -right-3 bg-pink-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                <span>⭐</span> Evaluate
              </div>

              <!-- Submit Chip (Blue) -->
              <div class="absolute -bottom-3 -right-3 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 animate-pulse">
                <span>🚀</span> Submit
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-16 bg-white border-t border-[#E5EAF2] px-6 md:px-12">
        <div class="max-w-6xl mx-auto space-y-12 text-center">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Core Capabilities</span>
            <h2 class="text-3xl font-bold text-[#0B1F44] mt-1">Everything You Need for Lab Excellence</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <!-- Feature 1 -->
            <div class="bg-[#F5F7FB] p-6 rounded-xl border border-[#E5EAF2] hover:shadow-md transition-shadow">
              <div class="w-10 h-10 rounded-lg bg-[#EAF1FF] text-[#2563EB] flex items-center justify-center font-bold text-lg mb-4">
                📚
              </div>
              <h3 class="text-base font-bold text-[#0B1F44]">Subjects & Assignments</h3>
              <p class="text-xs text-[#475569] mt-2 leading-relaxed">
                Organize assignments by department, year, and semester. Faculty can set due dates, instructions, and open/close controls.
              </p>
            </div>

            <!-- Feature 2 -->
            <div class="bg-[#F5F7FB] p-6 rounded-xl border border-[#E5EAF2] hover:shadow-md transition-shadow">
              <div class="w-10 h-10 rounded-lg bg-[#EAF1FF] text-[#2563EB] flex items-center justify-center font-bold text-lg mb-4">
                ⚡
              </div>
              <h3 class="text-base font-bold text-[#0B1F44]">Integrated Code Runner</h3>
              <p class="text-xs text-[#475569] mt-2 leading-relaxed">
                Run and test your code online in Java, Python, C++, C, or JavaScript with Judge0 execution engine before final submission.
              </p>
            </div>

            <!-- Feature 3 -->
            <div class="bg-[#F5F7FB] p-6 rounded-xl border border-[#E5EAF2] hover:shadow-md transition-shadow">
              <div class="w-10 h-10 rounded-lg bg-[#EAF1FF] text-[#2563EB] flex items-center justify-center font-bold text-lg mb-4">
                📊
              </div>
              <h3 class="text-base font-bold text-[#0B1F44]">Quizzes & Evaluations</h3>
              <p class="text-xs text-[#475569] mt-2 leading-relaxed">
                Take timed quizzes with auto-submit protection. Faculty evaluate solutions using structured rubrics (Correctness, Quality, Explanation).
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section id="about" class="py-16 px-6 md:px-12 max-w-5xl mx-auto text-center space-y-6">
        <span class="text-xs font-bold uppercase tracking-wider text-[#2563EB]">About LabFlow</span>
        <h2 class="text-3xl font-bold text-[#0B1F44]">Modernizing Computer Science Laboratories</h2>
        <p class="text-sm text-[#475569] max-w-2xl mx-auto leading-relaxed">
          LabFlow simplifies academic lab management by bringing curriculum subjects, programming assignments, timed interactive quizzes, automated code execution, and rubric-based evaluations into one unified platform.
        </p>
      </section>

      <!-- Footer with Role Portals -->
      <footer class="bg-[#0B1F44] text-white py-12 px-6 md:px-12 mt-auto border-t border-[#1A3160]">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-2">
            <svg class="w-6 h-6 text-[#60A5FA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/>
              <path d="M8.5 2h7"/>
              <path d="M7 16h10"/>
            </svg>
            <span class="font-bold text-lg text-white">LabFlow</span>
            <span class="text-xs text-[#94A3B8] ml-2">© 2026 LabFlow Platform</span>
          </div>

          <div class="flex flex-wrap items-center gap-6 text-xs text-[#94A3B8]">
            <a routerLink="/login/student" class="hover:text-white transition-colors">Student Login</a>
            <span>•</span>
            <a routerLink="/login/faculty" class="hover:text-white transition-colors">Faculty Portal</a>
            <span>•</span>
            <a routerLink="/login/admin" class="hover:text-white transition-colors">Admin Portal</a>
            <span>•</span>
            <a routerLink="/register" class="hover:text-white transition-colors">Register as Student</a>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class LandingComponent {}
