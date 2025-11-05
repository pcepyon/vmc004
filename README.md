# VMC Chat Application

Next.js 15 + Hono + Supabase 기반의 실시간 채팅 애플리케이션입니다.

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [환경 변수 설정](#환경-변수-설정)
- [데이터베이스 마이그레이션](#데이터베이스-마이그레이션)
- [API 라우트](#api-라우트)
- [개발 가이드](#개발-가이드)

## 프로젝트 개요

VMC004는 Next.js 15의 App Router와 Hono 프레임워크를 결합한 풀스택 채팅 애플리케이션입니다.
Supabase를 백엔드로 사용하여 실시간 메시징, 사용자 인증, 프로필 관리 기능을 제공합니다.

## 주요 기능

### 🔐 인증 시스템
- 이메일 기반 회원가입/로그인
- Supabase Auth 기반 세션 관리
- 보호된 라우트 (Protected Routes)

### 💬 채팅 기능
- **채팅방 생성**: 사용자가 새로운 채팅방을 생성할 수 있습니다
- **채팅방 목록**: 모든 채팅방을 카드 형식으로 표시
- **실시간 메시징**: 채팅방 내에서 실시간으로 메시지 송수신
- **답장 기능**: 특정 메시지에 대한 답장 지원
- **메시지 수정/삭제**: 본인이 작성한 메시지 편집 및 삭제
- **좋아요 기능**: 메시지에 좋아요 추가/제거

### 👤 사용자 기능
- **프로필 관리**: 닉네임, 이메일 등 개인 정보 관리
- **마이페이지**: 개인 프로필 조회 및 수정

## 기술 스택

### Frontend
- **Next.js 15**: React 프레임워크 (App Router)
- **React 19**: UI 라이브러리
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 유틸리티 우선 CSS 프레임워크
- **Shadcn UI**: 접근 가능한 UI 컴포넌트 라이브러리
- **Lucide React**: 아이콘 라이브러리

### State Management
- **TanStack React Query**: 서버 상태 관리
- **Zustand**: 클라이언트 상태 관리
- **React Hook Form**: 폼 상태 관리 및 유효성 검사

### Backend
- **Hono**: 경량 웹 프레임워크 (API 라우트)
- **Supabase**: BaaS (인증, 데이터베이스)
- **PostgreSQL**: 관계형 데이터베이스

### Utilities
- **Zod**: 스키마 유효성 검사
- **date-fns**: 날짜/시간 처리
- **ts-pattern**: 타입 안전 패턴 매칭
- **es-toolkit**: 유틸리티 함수
- **react-use**: React 훅 컬렉션
- **Axios**: HTTP 클라이언트

## 프로젝트 구조

```
VMC004/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (protected)/              # 인증이 필요한 페이지
│   │   │   ├── dashboard/            # 대시보드
│   │   │   └── layout.tsx            # 보호된 레이아웃
│   │   ├── api/[[...hono]]/          # Hono API 엔트리포인트
│   │   ├── room/[roomId]/            # 채팅방 상세 페이지
│   │   ├── create-room/              # 채팅방 생성 페이지
│   │   ├── login/                    # 로그인 페이지
│   │   ├── signup/                   # 회원가입 페이지
│   │   └── page.tsx                  # 홈페이지 (채팅방 목록)
│   │
│   ├── backend/                      # 백엔드 레이어
│   │   ├── hono/                     # Hono 앱 설정
│   │   │   ├── app.ts                # 메인 Hono 앱 (싱글톤)
│   │   │   └── context.ts            # 앱 컨텍스트 타입
│   │   ├── middleware/               # 공통 미들웨어
│   │   │   ├── auth.ts               # 인증 미들웨어
│   │   │   ├── context.ts            # 컨텍스트 주입
│   │   │   ├── error.ts              # 에러 바운더리
│   │   │   └── supabase.ts           # Supabase 클라이언트 주입
│   │   ├── http/                     # HTTP 유틸리티
│   │   │   └── response.ts           # 표준 응답 포맷
│   │   ├── supabase/                 # Supabase 설정
│   │   │   └── client.ts             # 서버 클라이언트
│   │   └── config/                   # 환경 변수 관리
│   │
│   ├── features/                     # 기능별 모듈
│   │   ├── auth/                     # 인증 기능
│   │   │   ├── backend/route.ts      # 인증 API 라우트
│   │   │   ├── context/              # 인증 컨텍스트
│   │   │   ├── hooks/                # 인증 훅
│   │   │   └── server/               # 서버 유틸리티
│   │   │
│   │   ├── rooms/                    # 채팅방 목록 기능
│   │   │   ├── backend/
│   │   │   │   ├── route.ts          # 채팅방 목록 API
│   │   │   │   ├── service.ts        # 비즈니스 로직
│   │   │   │   ├── schema.ts         # Zod 스키마
│   │   │   │   └── error.ts          # 에러 코드
│   │   │   ├── components/           # 채팅방 목록 컴포넌트
│   │   │   ├── hooks/                # React Query 훅
│   │   │   └── lib/dto.ts            # DTO 타입
│   │   │
│   │   ├── room/                     # 채팅방 생성 기능
│   │   │   ├── backend/              # 채팅방 생성 API
│   │   │   ├── components/           # 생성 폼 컴포넌트
│   │   │   ├── hooks/                # 생성 훅
│   │   │   └── lib/                  # DTO 및 유효성 검사
│   │   │
│   │   ├── chat-room/                # 채팅 기능
│   │   │   ├── backend/
│   │   │   │   ├── route.ts          # 채팅 API (메시지 CRUD)
│   │   │   │   ├── schema.ts         # 메시지 스키마
│   │   │   │   └── error.ts          # 에러 정의
│   │   │   ├── components/           # 채팅 UI 컴포넌트
│   │   │   │   ├── chat-room-page.tsx
│   │   │   │   ├── message-list.tsx
│   │   │   │   ├── message-item.tsx
│   │   │   │   ├── message-input.tsx
│   │   │   │   ├── reply-bar.tsx
│   │   │   │   └── delete-confirm-dialog.tsx
│   │   │   ├── context/              # 채팅 상태 관리
│   │   │   ├── hooks/                # 채팅 훅
│   │   │   ├── lib/api.ts            # API 클라이언트
│   │   │   └── types/                # 상태 및 액션 타입
│   │   │
│   │   └── profile/                  # 프로필 기능
│   │       ├── backend/              # 프로필 API
│   │       ├── components/           # 프로필 컴포넌트
│   │       ├── hooks/                # 프로필 훅
│   │       └── lib/dto.ts            # DTO 타입
│   │
│   ├── components/ui/                # Shadcn UI 컴포넌트
│   ├── hooks/                        # 공통 훅
│   ├── lib/                          # 유틸리티 함수
│   │   ├── supabase/                 # Supabase 클라이언트
│   │   └── utils.ts                  # 헬퍼 함수
│   └── constants/                    # 상수 정의
│
├── supabase/
│   └── migrations/                   # 데이터베이스 마이그레이션
│       ├── 0001_create_example_table.sql
│       ├── 0002_create_vmc_chat_schema.sql
│       └── 0003_create_profiles_trigger.sql
│
├── .env.example                      # 환경 변수 예제
├── CLAUDE.md                         # 개발 가이드라인
└── package.json                      # 프로젝트 의존성
```

## 시작하기

### 사전 요구사항

- Node.js 20 이상
- npm, yarn, pnpm 또는 bun
- Supabase 프로젝트

### 설치

1. **저장소 클론**

```bash
git clone <repository-url>
cd VMC004
```

2. **의존성 설치**

```bash
npm install
```

3. **환경 변수 설정**

`.env.example` 파일을 `.env.local`로 복사하고 Supabase 정보를 입력합니다:

```bash
cp .env.example .env.local
```

4. **개발 서버 실행**

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인할 수 있습니다.

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정해야 합니다:

```env
# Supabase 공개 설정 (클라이언트 사이드)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase 서버 설정 (서버 사이드)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Supabase 프로젝트 설정에서 이 값들을 확인할 수 있습니다:
- Dashboard → Settings → API

## 데이터베이스 마이그레이션

Supabase SQL Editor에서 다음 마이그레이션 파일들을 순서대로 실행해야 합니다:

### 1. Example 테이블 (선택사항)
```bash
supabase/migrations/0001_create_example_table.sql
```

### 2. VMC Chat 스키마 (필수)
```bash
supabase/migrations/0002_create_vmc_chat_schema.sql
```

이 마이그레이션은 다음 테이블을 생성합니다:
- `profiles`: 사용자 프로필
- `rooms`: 채팅방
- `messages`: 메시지
- `likes`: 메시지 좋아요

### 3. 프로필 트리거 (필수)
```bash
supabase/migrations/0003_create_profiles_trigger.sql
```

회원가입 시 자동으로 프로필을 생성하는 트리거입니다.

## API 라우트

모든 API는 `/api` 경로를 기본으로 합니다:

### 인증 API
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃

### 채팅방 API
- `GET /api/rooms` - 채팅방 목록 조회
- `POST /api/rooms` - 채팅방 생성
- `GET /api/rooms/:roomId` - 채팅방 상세 조회

### 메시지 API
- `GET /api/rooms/:roomId/messages` - 메시지 목록 조회
- `POST /api/rooms/:roomId/messages` - 메시지 전송
- `PATCH /api/rooms/:roomId/messages/:messageId` - 메시지 수정
- `DELETE /api/rooms/:roomId/messages/:messageId` - 메시지 삭제

### 좋아요 API
- `POST /api/rooms/:roomId/messages/:messageId/likes` - 좋아요 추가
- `DELETE /api/rooms/:roomId/messages/:messageId/likes` - 좋아요 제거

### 프로필 API
- `GET /api/profile` - 내 프로필 조회
- `PATCH /api/profile` - 프로필 수정

## 개발 가이드

### 아키텍처 원칙

#### 1. 클라이언트 컴포넌트 우선
- 모든 컴포넌트는 `"use client"` 지시어를 사용합니다
- 서버 상태는 React Query로만 관리합니다

#### 2. 기능별 모듈화
- `src/features/[featureName]` 구조를 따릅니다
- 각 기능은 독립적인 backend, components, hooks를 가집니다

#### 3. 백엔드 레이어
- **Hono 라우터**: `backend/route.ts`에서 API 엔드포인트 정의
- **서비스 로직**: `backend/service.ts`에서 Supabase 접근 및 비즈니스 로직
- **스키마 정의**: `backend/schema.ts`에서 Zod를 사용한 요청/응답 유효성 검사
- **에러 코드**: `backend/error.ts`에서 도메인별 에러 정의

#### 4. 프론트엔드 레이어
- **컴포넌트**: `components/`에서 UI 정의
- **훅**: `hooks/`에서 React Query 및 상태 관리
- **DTO**: `lib/dto.ts`에서 backend 스키마 재노출

### 새로운 기능 추가하기

1. **디렉토리 구조 생성**
```bash
src/features/[new-feature]/
├── backend/
│   ├── route.ts      # API 라우트
│   ├── service.ts    # 비즈니스 로직
│   ├── schema.ts     # Zod 스키마
│   └── error.ts      # 에러 정의
├── components/       # UI 컴포넌트
├── hooks/           # React Query 훅
└── lib/
    └── dto.ts       # DTO 타입
```

2. **Hono 앱에 라우터 등록**
`src/backend/hono/app.ts`:
```typescript
import { registerNewFeatureRoutes } from '@/features/new-feature/backend/route';

export const createHonoApp = () => {
  // ...
  registerNewFeatureRoutes(app);
  // ...
};
```

3. **필요시 마이그레이션 추가**
```bash
supabase/migrations/000X_new_feature_schema.sql
```

### 코딩 스타일

#### TypeScript
- 타입 안정성을 최우선으로 합니다
- `any` 타입 사용을 지양합니다
- Zod를 사용한 런타임 유효성 검사를 적극 활용합니다

#### React
- 함수형 컴포넌트만 사용합니다
- 커스텀 훅으로 로직을 분리합니다
- Early return 패턴을 사용합니다

#### Styling
- Tailwind CSS 유틸리티 클래스를 사용합니다
- Shadcn UI 컴포넌트를 우선 사용합니다
- 새 Shadcn 컴포넌트 추가:
```bash
npx shadcn@latest add [component-name]
```

#### 함수형 프로그래밍
- 순수 함수를 지향합니다
- 불변성을 유지합니다
- `map`, `filter`, `reduce` 등을 활용합니다
- `ts-pattern`으로 타입 안전 분기를 구현합니다

### 테스트

(현재 테스트 설정이 없습니다. 추후 추가 예정)

## 사용 가능한 스크립트

```bash
# 개발 서버 실행 (Turbopack 사용)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint
```

## 라이브러리 참고

- [Next.js Documentation](https://nextjs.org/docs)
- [Hono Documentation](https://hono.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn UI](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zod](https://zod.dev)

## 라이선스

이 프로젝트는 개인 프로젝트입니다.

---

**개발자를 위한 추가 정보**는 `CLAUDE.md` 파일을 참고하세요.
