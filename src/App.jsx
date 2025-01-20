import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { AlertCircle, Check, Plane, Loader2 } from 'lucide-react';

// 로고 컴포넌트
const Logo = ({ onClick }) => (
  <h1 
    onClick={onClick} 
    className="text-2xl font-bold text-gray-800 cursor-pointer hover:text-blue-700 transition-colors flex items-center"
  >
    <span className="text-blue-700 mr-2">●</span>
    PestsFree
  </h1>
);

// 메인 화면 컴포넌트
const WelcomeScreen = ({ onStart }) => (
  <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center p-6">
    <div className="max-w-3xl w-full text-center">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 flex items-center justify-center">
          <span className="text-blue-700 mr-3">●</span>
          PestsFree
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          드론을 이용한 스마트한 해충 관리 시스템
        </p>
      </div>
      <button
        onClick={onStart}
        className="bg-blue-700 hover:bg-blue-800 text-white px-12 py-4 rounded text-lg font-medium 
        transition-colors shadow-md hover:shadow-lg"
      >
        시스템 시작하기
      </button>
    </div>
  </div>
);

// 상태 표시 컴포넌트
const StatusIndicator = ({ connected }) => (
  <div className={`flex items-center space-x-2 ${connected ? 'text-green-600' : 'text-gray-500'}
    border rounded-md px-4 py-2 bg-white shadow-sm`}>
    <Plane className="h-5 w-5" />
    <span className="text-sm font-medium">
      {connected ? '드론 연결됨' : '연결 중...'}
    </span>
  </div>
);

// 체크리스트 아이템 컴포넌트
const ChecklistItem = ({ title, description, checked, error }) => (
  <div className="flex items-start space-x-3 border rounded-lg p-4 bg-white shadow-sm">
    <div className={`mt-1 p-1 rounded-full ${
      error ? 'bg-red-100 text-red-600' : 
      checked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
    }`}>
      {error ? (
        <AlertCircle className="w-4 h-4" />
      ) : checked ? (
        <Check className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
    </div>
    <div>
      <h3 className="font-medium text-gray-800">{title}</h3>
      <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-600'}`}>{description}</p>
    </div>
  </div>
);

// Google Maps 컴포넌트
const GoogleMap = ({ markers, coordinates, onPathCreated, isDrawingPath }, ref) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);

  // 특정 위치로 지도 이동 함수 추가
  const moveToLocation = (lat, lng) => {
    if (mapInstance.current) {
      mapInstance.current.setCenter({ lat, lng });
      mapInstance.current.setZoom(18);
    }
  };

  // 컴포넌트 props로 moveToLocation 함수 노출
  React.useImperativeHandle(ref, () => ({
    moveToLocation
  }));

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const defaultCenter = { lat: 37.5665, lng: 126.9780 };
      const center = coordinates || defaultCenter;

      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 15,
        mapTypeId: 'satellite',
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        tilt: 0,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_RIGHT,
        },
      });

      mapInstance.current = map;

      if (coordinates) {
        new window.google.maps.Marker({
          position: coordinates,
          map: map,
          title: '현재 위치',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4299e1',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });
      }
    };

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&callback=initGoogleMap`;
      script.async = true;
      script.defer = true;

      window.initGoogleMap = () => {
        initMap();
        delete window.initGoogleMap;
      };

      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        if (window.initGoogleMap) {
          delete window.initGoogleMap;
        }
      };
    };

    const cleanup = loadGoogleMaps();

    return () => {
      if (cleanup) cleanup();
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
      }
    };
  }, [coordinates]);

  // 마커 업데이트
  useEffect(() => {
    if (!mapInstance.current || !window.google || !window.google.maps) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 이전 InfoWindow 닫기
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    markers.forEach(({ lat, lng, isPestDetected }, index) => {
      const infowindowContent = isPestDetected ? `<div class="p-2" style="margin:0;padding:8px;font-family:'Noto Sans KR',sans-serif;">위도: ${lat.toFixed(6)}
경도: ${lng.toFixed(6)}
<p class="font-medium text-red-600" style="margin:4px 0;">해충 발견</p>
<img src="https://jeju-cloud-03-bugimagetest.s3.us-east-1.amazonaws.com/bugbug.jpeg" 
  alt="발견된 해충" style="width:200px;height:150px;object-fit:cover;margin-top:8px;" /></div>` 
      : null;

      // 해충이 발견된 경우에만 마커 생성
      if (isPestDetected) {
        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstance.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#f56565',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        const infowindow = new window.google.maps.InfoWindow({
          content: infowindowContent,
        });

        marker.addListener('click', () => {
          // 이전 InfoWindow 닫기
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }
          infowindow.open(mapInstance.current, marker);
          infoWindowRef.current = infowindow;
        });

        // 첫 번째 해충 발견 지점의 InfoWindow 자동 열기
        if (!infoWindowRef.current) {
          infowindow.open(mapInstance.current, marker);
          infoWindowRef.current = infowindow;
        }

        markersRef.current.push(marker);
      }
    });

    // 처음 마커가 생성될 때 지도 영역과 줌 레벨 설정
    if (markers.length === 1) {
      mapInstance.current.setCenter(new window.google.maps.LatLng(coordinates.lat, coordinates.lng));
      mapInstance.current.setZoom(18); // 고정된 줌 레벨 설정
    }
  }, [markers, coordinates]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '400px',
        position: 'relative',
        overflow: 'hidden'
      }}
      className="rounded-lg shadow-md"
    />
  );
};

// forwardRef로 감싸기
const GoogleMapWithRef = forwardRef(GoogleMap);

// 시스템 점검 화면 컴포넌트
const SystemCheckScreen = ({ onLogoClick }) => {
  const [status, setStatus] = useState({
    location: false,
    droneConnection: false
  });
  const [coordinates, setCoordinates] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [searchStarted, setSearchStarted] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const markersRef = useRef([]);
  const mapRef = useRef(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const getLocation = () => {
    setLocationError(null);
    setStatus(prev => ({ ...prev, location: false }));
    
    if (!navigator.geolocation) {
      setLocationError('브라우저가 위치 정보를 지원하지 않습니다.');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setStatus(prev => ({ ...prev, location: true }));
        setLocationError(null);
      },
      (error) => {
        let errorMessage;
        switch (error.code) {
          case 1:
            errorMessage = '위치 정보 접근 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.';
            break;
          case 2:
            errorMessage = '현재 위치 정보를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
            break;
          case 3:
            errorMessage = '위치 정보 요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.';
            break;
          default:
            errorMessage = `위치 정보를 가져오는 중 오류가 발생했습니다. (${error.message})`;
        }
        setLocationError(errorMessage);
        setStatus(prev => ({ ...prev, location: false }));
      },
      options
    );
  };

  useEffect(() => {
    // 초기 위치 정보 가져오기
    getLocation();

    // 드론 연결 시뮬레이션
    const droneConnectionTimeout = setTimeout(() => {
      setStatus(prev => ({ ...prev, droneConnection: true }));
    }, 2000);

    return () => {
      clearTimeout(droneConnectionTimeout);
    };
  }, []);

  // 임시 객체 인식 시뮬레이션
  useEffect(() => {
    if (searchStarted && coordinates) {
      markersRef.current = [];
      let lastPosition = {
        lat: coordinates.lat,
        lng: coordinates.lng
      };

      // 경과 시간 타이머 설정
      const startTime = Date.now();
      const timeInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);

      let direction = 1; // 1: 오른쪽, -1: 왼쪽
      let row = 0; // 현재 행 번호
      const stepSize = 0.0002; // 이동 간격
      const rowHeight = 0.0001; // 행 간격
      const diagonalFactor = 0.3; // 대각선 이동 계수 (0~1 사이 값)

      // ㄹ자 모양으로 이동하면서 마커 생성
      const simulatePestDetection = () => {
        // 대각선 이동을 포함한 위치 계산
        const diagonalOffset = direction * stepSize * diagonalFactor;
        lastPosition = {
          lat: lastPosition.lat + diagonalOffset,
          lng: lastPosition.lng + (stepSize * direction)
        };

        // 경계 체크 (현재 위치에서 최대 200m)
        const maxDistance = 0.002;
        if (Math.abs(lastPosition.lng - coordinates.lng) > maxDistance) {
          // 다음 행으로 이동
          row++;
          const newRow = coordinates.lat + (row * rowHeight);
          
          lastPosition = {
            lat: newRow + (diagonalOffset * 2), // 약간의 대각선 효과 추가
            lng: direction > 0 ? 
              coordinates.lng + maxDistance : 
              coordinates.lng - maxDistance
          };
          
          direction *= -1; // 방향 전환
        }

        // 70% 확률로 해충이 감지되지 않음
        const isPestDetected = Math.random() > 0.7;

        // 새로운 마커 추가
        const newMarker = { 
          ...lastPosition,
          isPestDetected // 해충 감지 여부 추가
        };
        markersRef.current.push(newMarker);
        setMarkers([...markersRef.current]);
      };

      // 3초마다 새로운 해충 발견 시뮬레이션
      const detectionInterval = setInterval(simulatePestDetection, 3000);

      // 30초 후 탐색 종료
      const searchTimeout = setTimeout(() => {
        clearInterval(detectionInterval);
        clearInterval(timeInterval);
        setSearchStarted(false);
        setSearchResults(markersRef.current);
        setElapsedTime(0);
        const pestCount = markersRef.current.filter(marker => marker.isPestDetected).length;
        alert(`탐색이 완료되었습니다. 총 ${markersRef.current.length}개 지점 중 ${pestCount}개 지점에서 해충이 발견되었습니다.`);
      }, 30000);

      return () => {
        clearInterval(detectionInterval);
        clearInterval(timeInterval);
        clearTimeout(searchTimeout);
      };
    }
  }, [searchStarted, coordinates]);

  const handleStartSearch = () => {
    setSearchStarted(true);
    setMarkers([]);
    setSearchResults(null);
    setShowResults(false);
    setElapsedTime(0);
  };

  // 해충 발견 위치로 이동하는 함수
  const handleLocationClick = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.moveToLocation(lat, lng);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        <header className="bg-white border-b mb-6 pb-6">
          <div className="flex items-center justify-between">
            <Logo onClick={onLogoClick} />
            <StatusIndicator connected={status.droneConnection} />
          </div>
        </header>

        <main className="space-y-6">
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b">
              {searchStarted ? '탐색 진행 중...' : (searchResults ? '탐색 완료' : '시스템 점검')}
            </h2>
            
            {!searchResults && !searchStarted ? (
              <>
                <div className="w-full mb-6 border rounded-lg overflow-hidden shadow-sm" 
                  style={{ minHeight: '400px' }}>
                  <GoogleMapWithRef 
                    markers={[]} 
                    coordinates={coordinates}
                  />
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-start space-x-4">
                    <ChecklistItem
                      title="위치 확인"
                      description={
                        locationError ? locationError :
                        coordinates ? 
                        `위도: ${coordinates.lat.toFixed(6)}, 경도: ${coordinates.lng.toFixed(6)}` : 
                        '위치 확인 중...'
                      }
                      checked={status.location}
                      error={locationError ? true : false}
                    />
                    {(locationError || coordinates) && (
                      <button
                        onClick={getLocation}
                        className="px-4 py-2 border text-gray-600 rounded hover:bg-gray-50 
                        transition-colors shadow-sm text-sm"
                      >
                        GPS 재설정
                      </button>
                    )}
                  </div>
                  <ChecklistItem
                    title="드론 연결 상태"
                    description={status.droneConnection 
                      ? '드론이 정상적으로 연결되었습니다' 
                      : '드론 연결 중...'}
                    checked={status.droneConnection}
                  />
                </div>
                <button
                  onClick={handleStartSearch}
                  disabled={!status.location || !status.droneConnection}
                  className={`w-full py-3 px-6 rounded transition-colors text-lg font-medium shadow-sm
                    ${status.location && status.droneConnection
                      ? 'bg-blue-700 hover:bg-blue-800 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  탐색 시작
                </button>
              </>
            ) : (
              <div className="space-y-6">
                <div className="w-full border rounded-lg overflow-hidden shadow-sm" 
                  style={{ minHeight: '400px' }}>
                  <GoogleMapWithRef 
                    ref={mapRef}
                    markers={markers} 
                    coordinates={coordinates}
                  />
                </div>
                
                <div className="bg-gray-50 border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <h3 className="text-lg font-medium text-gray-800">
                      {searchStarted ? '실시간 탐지 현황' : '최종 탐지 결과'}
                    </h3>
                    <div className="flex items-center space-x-3">
                      {!searchStarted ? (
                        <span className="bg-red-50 text-red-700 px-3 py-1 rounded-md text-sm font-medium border border-red-100">
                          해충 {markers.filter(m => m.isPestDetected).length}건 발견
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-700 px-3 py-1 rounded-md text-sm font-medium border border-red-100">
                          해충 {markers.filter(m => m.isPestDetected).length}건 발견
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {searchStarted ? (
                    <div className="flex flex-col items-center space-y-4 py-4">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <p className="text-gray-600 text-center">
                        드론이 이동하며 해충을 탐지하고 있습니다.
                        <br />
                        <span className="text-sm text-gray-500">경과 시간: {elapsedTime}초</span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {showResults ? (
                        <>
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {searchResults.filter(result => result.isPestDetected).map((result, index) => (
                              <div key={index} 
                                className="flex items-center space-x-3 p-3 bg-white rounded border cursor-pointer hover:bg-gray-50"
                                onClick={() => handleLocationClick(result.lat, result.lng)}
                              >
                                <span className="w-2 h-2 rounded-full flex-shrink-0 bg-red-500"></span>
                                <span className="text-gray-600">
                                  {index + 1}번째 해충 발견
                                </span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => setShowResults(false)}
                            className="w-full py-2 px-4 border text-gray-600 rounded 
                            hover:bg-gray-50 transition-colors text-sm"
                          >
                            상세 정보 접기
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setShowResults(true)}
                          className="w-full bg-gray-100 border text-gray-700 py-2 px-4 rounded 
                          hover:bg-gray-200 transition-colors shadow-sm font-medium"
                        >
                          상세 정보 보기
                        </button>
                      )}
                      <button
                        onClick={handleStartSearch}
                        className="w-full bg-blue-700 text-white py-3 px-4 rounded 
                        hover:bg-blue-800 transition-colors shadow-sm mt-4"
                      >
                        새로운 탐색 시작
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// 메인 앱 컴포넌트
const App = () => {
  const [showSystemCheck, setShowSystemCheck] = useState(false);

  const handleLogoClick = () => {
    setShowSystemCheck(false);
  };

  return showSystemCheck ? (
    <SystemCheckScreen onLogoClick={handleLogoClick} />
  ) : (
    <WelcomeScreen onStart={() => setShowSystemCheck(true)} />
  );
};

export default App; 