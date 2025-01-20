# PestsFree - 드론 기반 해충 탐지 시스템

## 프로젝트 소개
PestsFree는 드론을 활용하여 농작물의 해충을 실시간으로 탐지하고 관리하는 스마트 농업 솔루션입니다. 
드론이 지정된 경로를 따라 이동하며 해충을 탐지하고, 발견된 해충의 위치를 지도상에 표시하여 효율적인 방제 작업을 지원합니다.

## 주요 기능
- 실시간 GPS 기반 위치 추적
- 드론 연결 및 상태 모니터링
- 해충 탐지 및 위치 기록
- 위성 지도 기반 시각화
- 탐지 결과 실시간 확인
- 상세 정보 조회 및 위치 이동

## 기술 스택
- React
- Tailwind CSS
- Google Maps API
- AWS Amplify
- AWS S3

## 설치 및 실행
1. 저장소 클론
```bash
git clone https://github.com/Jeju-CloudAi-Hackathon/front-react-25-jeju.git
cd front-react-25-jeju
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 추가:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. 개발 서버 실행
```bash
npm start
```

## 사용 방법
1. 시스템 시작하기 버튼 클릭
2. GPS 위치 확인 및 드론 연결 대기
3. 탐색 시작 버튼으로 해충 탐지 시작
4. 실시간으로 탐지 현황 확인
5. 탐지 완료 후 상세 정보에서 발견 위치 확인

## 팀 정보
- 제주 클라우드 AI 해커톤
- 팀 25

## 라이선스
This project is licensed under the MIT License
