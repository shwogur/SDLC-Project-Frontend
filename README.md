# 🎓 학생 고충·민원 처리 시스템 (Student Complaint Management System) - Frontend

[cite_start]본 프로젝트는 학생들이 학교생활에서 겪는 불편, 차별, 건의사항 등을 온라인으로 신속하게 접수하고 투명하게 처리하기 위해 개발된 웹 기반 시스템의 프론트엔드 레포지토리입니다[cite: 7].

## 📌 프로젝트 개요
* [cite_start]**개발 기간:** 2024.09 ~ 2024.12 (3개월) [cite: 647]
* [cite_start]**개발자:** 노재혁 (Full Stack Engineer) [cite: 672]
* [cite_start]**목표:** 기존 아날로그/개별적 민원 관리 방식의 누락 및 지연 문제를 해결하고, 직관적인 UI를 통해 학생들의 소통 창구 활성화[cite: 659, 660, 661].

## 🛠 기술 스택
* [cite_start]**Framework / Language:** React, TypeScript [cite: 730]
* [cite_start]**UI/UX Design:** Figma (직관성과 명확성을 강조한 상태 기반 UI 설계) [cite: 700, 701, 712]
* [cite_start]**Architecture:** Component-based UI [cite: 731]

## 🌟 주요 기능
[cite_start]로그인한 사용자 권한(학생, 학생회, 교사)에 따라 맞춤형 대시보드와 기능을 제공합니다[cite: 55, 685].

### 1. 학생 (Student)
* [cite_start]**민원 등록:** 복잡한 절차 없이 카테고리(시설, 수업, 생활 등), 제목, 내용을 입력하여 간편하게 민원 접수[cite: 86, 536, 677].
* [cite_start]**민원 상태 조회:** 본인이 등록한 민원의 처리 상태(대기중, 진행중, 완료 등) 실시간 확인[cite: 98, 236, 677].

### 2. 학생회 (Student Council)
* [cite_start]**민원 검토 및 승인:** 접수된 전체 민원 목록을 확인하고, 상태 필터링을 통해 대기 중인 민원을 검토[cite: 242, 243].
* [cite_start]**상태 업데이트:** 민원 내용에 따라 교사에게 이관(승인)하거나 사유를 작성하여 반려 처리[cite: 124, 126, 246].

### 3. 교사 (Teacher)
* [cite_start]**최종 처리:** 학생회가 승인한 민원을 검토 후 최종 처리 및 완료 상태 업데이트[cite: 36, 133, 263].
* [cite_start]**처리 결과 알림:** 처리 완료된 민원에 대한 피드백(처리 완료 메시지) 작성[cite: 141, 599].

## 💡 Trouble Shooting
[cite_start]**이슈:** 초기 민원 등록 시, 프론트엔드에서 전송한 폼 데이터가 백엔드 API 스펙과 일치하지 않아 서버에서 제대로 처리되지 않는 현상 발생[cite: 772, 773].
[cite_start]**해결:** 프론트엔드의 요청 데이터를 백엔드 API(RESTful) 규격에 맞게 매핑 로직을 수정하고, 서버 응답에 따른 에러 처리(Error Handling) UI를 보강하여 민원 등록이 안정적으로 이루어지도록 개선했습니다[cite: 775].
  # Student Complaint Management App

  This is a code bundle for Student Complaint Management App. The original project is available at https://www.figma.com/design/HXQPNgh3k2Wgtv0bd8Srt0/Student-Complaint-Management-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
